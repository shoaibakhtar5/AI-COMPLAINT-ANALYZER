from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Complaint, Organization
from app.schemas.complaints import ComplaintCreate
from app.services.complaints import PENDING_ANALYSIS, serialize_complaint


router = APIRouter(prefix="/public", tags=["Public Intake"])


def _default_organization(db: Session) -> Organization:
    organization = db.scalar(select(Organization).order_by(Organization.created_at.asc()).limit(1))
    if not organization:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="No organization workspace is available for public intake")
    return organization


@router.post("/complaints", status_code=status.HTTP_201_CREATED)
def submit_public_complaint(payload: ComplaintCreate, db: Session = Depends(get_db)):
    organization = _default_organization(db)
    item = Complaint(
        organization_id=organization.id,
        uploaded_by=None,
        customer_name=payload.customer_name,
        customer_email=payload.customer_email,
        complaint_text=payload.complaint_text,
        category=None,
        sentiment=None,
        priority=None,
        confidence_score=None,
        ai_explanation=None,
        department=None,
        source="Public Portal",
        status=PENDING_ANALYSIS,
        assignee="Unassigned",
        notes=payload.notes,
        analyzed_at=None,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return serialize_complaint(item)


@router.get("/track/{complaint_id}")
def track_public_complaint(complaint_id: str, db: Session = Depends(get_db)):
    item = db.get(Complaint, complaint_id)
    if not item:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return serialize_complaint(item)


@router.post("/track/{complaint_id}/escalate")
def escalate_public_complaint(complaint_id: str, db: Session = Depends(get_db)):
    item = db.get(Complaint, complaint_id)
    if not item:
        raise HTTPException(status_code=404, detail="Complaint not found")
    item.notes = "\n".join([part for part in [item.notes, "Customer requested escalation."] if part])
    db.commit()
    db.refresh(item)
    return serialize_complaint(item)
