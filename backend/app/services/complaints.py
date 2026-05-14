from datetime import datetime, timezone
from math import ceil
from sqlalchemy import and_, func, or_, select
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.ai.predict import predict_complaint
from app.models import Complaint, User
from app.schemas.complaints import ComplaintCreate, ComplaintUpdate
from app.services.activity import log_activity

PENDING_ANALYSIS = "Pending Analysis"
SOLVED = "Solved"
ANALYSIS_FAILED = "Analysis Failed"


def _has_analysis(item: Complaint) -> bool:
    return bool(
        item.status == SOLVED
        and item.category
        and item.sentiment
        and item.priority
        and item.department
        and item.confidence_score is not None
    )


def serialize_complaint(item: Complaint) -> dict:
    analyzed = _has_analysis(item)
    return {
        "id": item.id,
        "complaint_text": item.complaint_text,
        "customer_name": item.customer_name,
        "customer_email": item.customer_email,
        "category": item.category if analyzed else None,
        "sentiment": item.sentiment if analyzed else None,
        "priority": item.priority if analyzed else None,
        "confidence_score": item.confidence_score if analyzed else None,
        "confidence": item.confidence_score if analyzed else None,
        "risk": item.confidence_score if analyzed else None,
        "ai_explanation": item.ai_explanation if analyzed or item.status == ANALYSIS_FAILED else None,
        "status": item.status,
        "department": item.department if analyzed else None,
        "analyzed_at": item.analyzed_at if analyzed else None,
        "source": item.source,
        "created_at": item.created_at,
        "updated_at": item.updated_at,
        "organization_id": item.organization_id,
        "uploaded_by": item.uploaded_by,
        "bulk_upload_id": item.bulk_upload_id,
        "assignee": item.assignee,
        "notes": item.notes,
        "resolution_time_hours": item.resolution_time_hours,
        "customer": item.customer_name,
        "message": item.complaint_text,
        "subject": item.complaint_text[:72],
        "contactEmail": item.customer_email or "",
        "date": item.created_at.date().isoformat(),
        "timeline": [
            {"label": "Received", "at": item.created_at.isoformat(), "completed": True},
            {"label": "AI Analysis", "at": item.analyzed_at.isoformat() if item.analyzed_at else "-", "completed": analyzed},
            {"label": "Solved", "at": "Completed" if item.status == SOLVED else "-", "completed": item.status == SOLVED},
        ],
    }


def create_complaint(db: Session, user: User, payload: ComplaintCreate) -> Complaint:
    item = Complaint(
        organization_id=user.organization_id,
        uploaded_by=user.id,
        customer_name=payload.customer_name,
        customer_email=payload.customer_email,
        complaint_text=payload.complaint_text,
        category=None,
        sentiment=None,
        priority=None,
        confidence_score=None,
        ai_explanation=None,
        department=None,
        source=payload.source,
        status=PENDING_ANALYSIS,
        assignee=payload.assignee,
        notes=payload.notes,
        analyzed_at=None,
    )
    db.add(item)
    db.flush()
    log_activity(db, user, "complaint.created", "complaint", item.id, {"status": item.status})
    db.commit()
    db.refresh(item)
    return item


def build_complaint_conditions(user: User, filters: dict):
    conditions = [Complaint.organization_id == user.organization_id]
    q = filters.get("q")
    if q:
        search = f"%{q.lower()}%"
        conditions.append(or_(
            func.lower(Complaint.id).like(search),
            func.lower(Complaint.customer_name).like(search),
            func.lower(Complaint.complaint_text).like(search),
            func.lower(func.coalesce(Complaint.category, "")).like(search),
            func.lower(func.coalesce(Complaint.department, "")).like(search),
            func.lower(Complaint.source).like(search),
        ))
    for key in ["status", "priority", "category", "sentiment", "source"]:
        if filters.get(key):
            conditions.append(getattr(Complaint, key).ilike(filters[key]))
    analysis_state = str(filters.get("analysis_state") or "").strip().lower()
    if analysis_state in {"analyzed", "solved"}:
        conditions.append(Complaint.status == SOLVED)
    elif analysis_state in {"not analyzed", "not-analyzed", "pending", "pending analysis"}:
        conditions.append(Complaint.status == PENDING_ANALYSIS)
    elif analysis_state in {"failed", "analysis failed"}:
        conditions.append(Complaint.status == ANALYSIS_FAILED)
    if filters.get("date_from"):
        conditions.append(Complaint.created_at >= filters["date_from"])
    if filters.get("date_to"):
        conditions.append(Complaint.created_at <= filters["date_to"])
    return conditions


def get_filtered_complaints(db: Session, user: User, filters: dict) -> list[Complaint]:
    return list(
        db.scalars(
            select(Complaint)
            .where(and_(*build_complaint_conditions(user, filters)))
            .order_by(Complaint.created_at.desc())
        )
    )


def list_complaints(db: Session, user: User, filters: dict):
    page = max(1, int(filters.pop("page", 1)))
    page_size = min(100, max(1, int(filters.pop("page_size", 10))))
    conditions = build_complaint_conditions(user, filters)

    where_clause = and_(*conditions)
    total = db.scalar(select(func.count()).select_from(Complaint).where(where_clause)) or 0
    items = db.scalars(
        select(Complaint)
        .where(where_clause)
        .order_by(Complaint.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    ).all()
    return {"items": [serialize_complaint(item) for item in items], "total": total, "page": page, "page_size": page_size, "pages": ceil(total / page_size) if total else 1}


def get_complaint(db: Session, user: User, complaint_id: str) -> Complaint:
    item = db.get(Complaint, complaint_id)
    if not item or item.organization_id != user.organization_id:
        raise HTTPException(status_code=404, detail="Complaint not found.")
    return item


def update_complaint(db: Session, user: User, complaint_id: str, payload: ComplaintUpdate) -> Complaint:
    item = get_complaint(db, user, complaint_id)
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, key, value)
    log_activity(db, user, "complaint.updated", "complaint", item.id, payload.model_dump(exclude_unset=True))
    db.commit()
    db.refresh(item)
    return item


def delete_complaint(db: Session, user: User, complaint_id: str) -> dict:
    item = get_complaint(db, user, complaint_id)
    details = {
        "customer_name": item.customer_name,
        "status": item.status,
        "bulk_upload_id": item.bulk_upload_id,
    }
    log_activity(db, user, "complaint.deleted", "complaint", item.id, details)
    db.delete(item)
    db.commit()
    return {"ok": True, "id": complaint_id}


def analyze_complaint(db: Session, user: User, complaint_id: str) -> Complaint:
    item = get_complaint(db, user, complaint_id)
    try:
        prediction = predict_complaint(item.complaint_text)
    except Exception as exc:
        item.status = ANALYSIS_FAILED
        item.ai_explanation = f"AI analysis failed: {exc}"
        log_activity(db, user, "complaint.analysis_failed", "complaint", item.id, {"error": str(exc)})
        db.commit()
        db.refresh(item)
        return item

    item.category = prediction["category"]
    item.sentiment = prediction["sentiment"]
    item.priority = prediction["priority"]
    item.confidence_score = float(prediction["confidence"])
    item.department = prediction["department"]
    item.ai_explanation = prediction["explanation"]
    item.status = SOLVED
    item.analyzed_at = datetime.now(timezone.utc).replace(tzinfo=None)
    if not item.resolution_time_hours:
        item.resolution_time_hours = 6.4
    log_activity(
        db,
        user,
        "complaint.analyzed",
        "complaint",
        item.id,
        {"category": item.category, "priority": item.priority, "confidence": item.confidence_score},
    )
    db.commit()
    db.refresh(item)
    return item


def advance_status(db: Session, user: User, complaint_id: str) -> Complaint:
    return analyze_complaint(db, user, complaint_id)
