from math import ceil
from sqlalchemy import and_, func, or_, select
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.ai.predict import predict_complaint
from app.models import Complaint, User
from app.schemas.complaints import ComplaintCreate, ComplaintUpdate
from app.services.activity import log_activity


def serialize_complaint(item: Complaint) -> dict:
    return {
        "id": item.id,
        "complaint_text": item.complaint_text,
        "customer_name": item.customer_name,
        "customer_email": item.customer_email,
        "category": item.category,
        "sentiment": item.sentiment,
        "priority": item.priority,
        "confidence_score": item.confidence_score,
        "confidence": item.confidence_score,
        "risk": item.confidence_score,
        "ai_explanation": item.ai_explanation,
        "status": item.status,
        "department": item.department,
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
            {"label": "Classified", "at": "AI auto", "completed": True},
            {"label": "Assigned", "at": item.assignee, "completed": item.status != "Pending"},
            {"label": "Solved", "at": "Completed" if item.status == "Solved" else "-", "completed": item.status == "Solved"},
        ],
    }


def create_complaint(db: Session, user: User, payload: ComplaintCreate) -> Complaint:
    prediction = predict_complaint(payload.complaint_text)
    item = Complaint(
        organization_id=user.organization_id,
        uploaded_by=user.id,
        customer_name=payload.customer_name,
        customer_email=payload.customer_email,
        complaint_text=payload.complaint_text,
        category=payload.category or prediction["category"],
        sentiment=payload.sentiment or prediction["sentiment"],
        priority=payload.priority or prediction["priority"],
        confidence_score=prediction["confidence"],
        ai_explanation=prediction["explanation"],
        department=payload.department or prediction["department"],
        source=payload.source,
        status="Solved",
        assignee=payload.assignee,
        notes=payload.notes,
    )
    db.add(item)
    db.flush()
    log_activity(db, user, "complaint.created", "complaint", item.id, {"category": item.category, "priority": item.priority})
    db.commit()
    db.refresh(item)
    return item


def list_complaints(db: Session, user: User, filters: dict):
    page = max(1, int(filters.pop("page", 1)))
    page_size = min(100, max(1, int(filters.pop("page_size", 10))))
    conditions = [Complaint.organization_id == user.organization_id]
    q = filters.get("q")
    if q:
        search = f"%{q.lower()}%"
        conditions.append(or_(
            func.lower(Complaint.id).like(search),
            func.lower(Complaint.customer_name).like(search),
            func.lower(Complaint.complaint_text).like(search),
            func.lower(Complaint.category).like(search),
            func.lower(Complaint.department).like(search),
            func.lower(Complaint.source).like(search),
        ))
    for key in ["status", "priority", "category", "sentiment", "source"]:
        if filters.get(key):
            conditions.append(getattr(Complaint, key).ilike(filters[key]))
    if filters.get("date_from"):
        conditions.append(Complaint.created_at >= filters["date_from"])
    if filters.get("date_to"):
        conditions.append(Complaint.created_at <= filters["date_to"])

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


def advance_status(db: Session, user: User, complaint_id: str) -> Complaint:
    item = get_complaint(db, user, complaint_id)
    item.status = "Solved"
    if not item.resolution_time_hours:
        item.resolution_time_hours = 6.4
    log_activity(db, user, "complaint.status_advanced", "complaint", item.id, {"status": item.status})
    db.commit()
    db.refresh(item)
    return item
