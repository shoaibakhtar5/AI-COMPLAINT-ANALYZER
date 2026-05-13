from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import desc, or_, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import ActivityLog, User
from app.schemas.integrations import IntegrationOut, IntegrationUpdate, NotificationOut
from app.services import integrations as service


router = APIRouter(prefix="/integrations", tags=["Integrations"])


@router.get("", response_model=list[IntegrationOut])
def list_items(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return service.list_integrations(db, user)


@router.patch("/{integration_id}", response_model=IntegrationOut)
def update_item(
    integration_id: str,
    payload: IntegrationUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    try:
        return service.update_integration(db, user, integration_id, payload)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("/{integration_id}/test", response_model=IntegrationOut)
def test_item(integration_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    try:
        return service.test_integration(db, user, integration_id)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/notifications", response_model=list[NotificationOut])
def notifications(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return service.list_notifications(db, user)


@router.post("/notifications/read", response_model=list[NotificationOut])
def read_notifications(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return service.mark_notifications_read(db, user)


@router.get("/activity")
def activity(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    rows = db.scalars(
        select(ActivityLog)
        .where(
            ActivityLog.organization_id == user.organization_id,
            or_(
                ActivityLog.entity_type == "integration",
                ActivityLog.action.ilike("%integration%"),
            ),
        )
        .order_by(desc(ActivityLog.timestamp))
        .limit(40)
    )
    return [
        {
            "id": row.id,
            "action": row.action,
            "entity_type": row.entity_type,
            "entity_id": row.entity_id,
            "timestamp": row.timestamp,
            "metadata": row.details,
        }
        for row in rows
    ]
