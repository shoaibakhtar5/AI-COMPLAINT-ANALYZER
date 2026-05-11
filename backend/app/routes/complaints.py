from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User
from app.schemas.complaints import ComplaintCreate, ComplaintListResponse, ComplaintOut, ComplaintUpdate
from app.services import complaints as service


router = APIRouter(prefix="/complaints", tags=["Complaints"])


@router.get("", response_model=ComplaintListResponse)
def list_items(
    q: str | None = None,
    status_value: str | None = Query(None, alias="status"),
    priority: str | None = None,
    category: str | None = None,
    sentiment: str | None = None,
    source: str | None = None,
    date_from: str | None = None,
    date_to: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return service.list_complaints(
        db,
        user,
        {
            "q": q,
            "status": status_value,
            "priority": priority,
            "category": category,
            "sentiment": sentiment,
            "source": source,
            "date_from": date_from,
            "date_to": date_to,
            "page": page,
            "page_size": page_size,
        },
    )


@router.post("", response_model=ComplaintOut, status_code=status.HTTP_201_CREATED)
def create_item(payload: ComplaintCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return service.create_complaint(db, user, payload)


@router.get("/{complaint_id}", response_model=ComplaintOut)
def get_item(complaint_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    try:
        return service.get_complaint(db, user, complaint_id)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.patch("/{complaint_id}", response_model=ComplaintOut)
def update_item(
    complaint_id: str,
    payload: ComplaintUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    try:
        return service.update_complaint(db, user, complaint_id, payload)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("/{complaint_id}/advance", response_model=ComplaintOut)
def advance_item(complaint_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    try:
        return service.advance_status(db, user, complaint_id)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
