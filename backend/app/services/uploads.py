from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import pandas as pd
from fastapi import UploadFile
from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.ai.predict import predict_complaints
from app.config import settings
from app.models import BulkUpload, Complaint, User
from app.services.activity import log_activity
from app.services.complaints import serialize_complaint
from app.utils.ids import upload_id


TEXT_COLUMNS = ("complaint_text", "complaint", "message", "description", "text", "issue")
NAME_COLUMNS = ("customer_name", "customer", "name", "full_name")
EMAIL_COLUMNS = ("customer_email", "email", "contact_email")


def _safe_filename(name: str) -> str:
    keep = [char if char.isalnum() or char in {".", "-", "_"} else "-" for char in name]
    return "".join(keep).strip(".-") or "upload"


def _first(row: dict[str, Any], keys: tuple[str, ...], default: str = "") -> str:
    lowered = {str(key).strip().lower(): value for key, value in row.items()}
    for key in keys:
        value = lowered.get(key)
        if value is not None and str(value).strip():
            return str(value).strip()
    return default


async def save_upload_file(file: UploadFile) -> Path:
    suffix = Path(file.filename or "complaints.csv").suffix.lower()
    if suffix not in {".csv", ".xlsx", ".xls"}:
        raise ValueError("Only CSV and Excel files are supported")

    settings.ensure_storage_dirs()
    filename = f"{upload_id()}-{_safe_filename(file.filename or 'complaints.csv')}"
    destination = Path(settings.upload_dir) / filename
    destination.write_bytes(await file.read())
    return destination


def parse_upload(path: Path) -> pd.DataFrame:
    if path.suffix.lower() == ".csv":
        return pd.read_csv(path)
    return pd.read_excel(path)


def _detect_text_column(frame: pd.DataFrame) -> str | None:
    normalized = {str(column).strip().lower(): column for column in frame.columns}
    for key in TEXT_COLUMNS:
        if key in normalized:
            return normalized[key]
    return None


def _distribution(items: list[str]) -> dict[str, int]:
    return dict(Counter(items))


def process_upload(db: Session, user: User, original_name: str, stored_path: Path) -> BulkUpload:
    upload = BulkUpload(
        file_name=original_name,
        stored_path=str(stored_path),
        upload_status="processing",
        uploaded_by=user.id,
        organization_id=user.organization_id,
        processing_logs=[{"level": "info", "message": "File accepted and queued for AI analysis"}],
    )
    db.add(upload)
    db.flush()

    created: list[Complaint] = []
    failures = 0
    logs = list(upload.processing_logs or [])
    frame = parse_upload(stored_path).fillna("")
    upload.total_rows = int(len(frame.index))
    if upload.total_rows and not _detect_text_column(frame):
        raise ValueError("No valid complaint text column found. Use one of: complaint, complaint_text, text, message, description")

    logs.append({"level": "info", "message": f"Parsed {upload.total_rows} rows from spreadsheet"})

    pending_rows: list[tuple[int, dict[str, Any], str]] = []
    for index, row in enumerate(frame.to_dict(orient="records"), start=1):
        complaint_text = _first(row, TEXT_COLUMNS)
        if not complaint_text:
            failures += 1
            logs.append({"level": "warning", "message": f"Row {index} skipped: missing complaint text"})
            continue
        pending_rows.append((index, row, complaint_text))

    predictions = predict_complaints([text for _, _, text in pending_rows]) if pending_rows else []

    for (index, row, complaint_text), prediction in zip(pending_rows, predictions, strict=False):
        complaint = Complaint(
            complaint_text=complaint_text,
            customer_name=_first(row, NAME_COLUMNS, default=f"Customer {index}"),
            customer_email=_first(row, EMAIL_COLUMNS) or None,
            category=prediction["category"],
            sentiment=prediction["sentiment"],
            priority=prediction["priority"],
            confidence_score=float(prediction["confidence"]),
            ai_explanation=prediction["explanation"],
            status="Solved",
            department=prediction["department"],
            analyzed_at=datetime.now(timezone.utc).replace(tzinfo=None),
            source="Bulk Upload",
            organization_id=user.organization_id,
            uploaded_by=user.id,
            bulk_upload_id=upload.id,
            assignee=str(row.get("assignee") or "Unassigned").strip() or "Unassigned",
            notes=str(row.get("notes") or "").strip() or None,
        )
        created.append(complaint)
        db.add(complaint)

    upload.processed_rows = len(created)
    upload.failed_rows = failures
    upload.upload_status = "completed" if failures == 0 else "completed_with_warnings"
    upload.analysis_summary = {
        "totalComplaints": len(created),
        "categoriesDetected": _distribution([item.category for item in created]),
        "sentimentDistribution": _distribution([item.sentiment for item in created]),
        "priorityBreakdown": _distribution([item.priority for item in created]),
        "statusBreakdown": _distribution([item.status for item in created]),
        "averageConfidence": round(sum(item.confidence_score for item in created) / len(created), 1) if created else 0,
    }
    logs.append({"level": "success", "message": f"AI processed {len(created)} complaints"})
    if failures:
        logs.append({"level": "warning", "message": f"{failures} rows need review"})
    upload.processing_logs = logs
    log_activity(db, user, "uploaded complaints file", "bulk_upload", upload.id, upload.analysis_summary)
    db.commit()
    db.refresh(upload)
    return upload


def list_uploads(db: Session, user: User) -> list[BulkUpload]:
    return list(
        db.scalars(
            select(BulkUpload)
            .where(BulkUpload.organization_id == user.organization_id)
            .order_by(desc(BulkUpload.upload_timestamp))
        )
    )


def get_upload_detail(db: Session, user: User, upload_id_value: str) -> dict:
    upload = db.scalar(
        select(BulkUpload).where(
            BulkUpload.id == upload_id_value,
            BulkUpload.organization_id == user.organization_id,
        )
    )
    if not upload:
        raise LookupError("Upload not found")
    return {
        "id": upload.id,
        "file_name": upload.file_name,
        "upload_status": upload.upload_status,
        "total_rows": upload.total_rows,
        "processed_rows": upload.processed_rows,
        "failed_rows": upload.failed_rows,
        "upload_timestamp": upload.upload_timestamp,
        "uploaded_by": upload.uploaded_by,
        "organization_id": upload.organization_id,
        "analysis_summary": upload.analysis_summary or {},
        "processing_logs": upload.processing_logs or [],
        "complaints": [serialize_complaint(item) for item in upload.complaints],
    }
