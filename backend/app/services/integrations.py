from datetime import datetime, timezone

from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.models import Integration, Notification, User
from app.schemas.integrations import IntegrationUpdate
from app.services.activity import log_activity


def _is_legacy_demo_connector(integration: Integration) -> bool:
    webhook = str((integration.config or {}).get("webhook", ""))
    return "api.sentra.local" in webhook or "api.crimson-ai.local" in webhook


def list_integrations(db: Session, user: User) -> list[Integration]:
    rows = list(
        db.scalars(
            select(Integration)
            .where(Integration.organization_id == user.organization_id)
            .order_by(Integration.created_at.asc())
        )
    )
    return [row for row in rows if not _is_legacy_demo_connector(row)]


def update_integration(db: Session, user: User, integration_id: str, payload: IntegrationUpdate) -> Integration:
    integration = db.scalar(
        select(Integration).where(
            Integration.id == integration_id,
            Integration.organization_id == user.organization_id,
        )
    )
    if not integration:
        raise LookupError("Integration not found")

    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(integration, key, value)
    log_activity(db, user, "updated integration", "integration", integration.id, {"fields": sorted(data.keys())})
    db.commit()
    db.refresh(integration)
    return integration


def test_integration(db: Session, user: User, integration_id: str) -> Integration:
    integration = db.scalar(
        select(Integration).where(
            Integration.id == integration_id,
            Integration.organization_id == user.organization_id,
        )
    )
    if not integration:
        raise LookupError("Integration not found")

    raise RuntimeError("Connection tests require a deployed connector service")


def list_notifications(db: Session, user: User) -> list[Notification]:
    return list(
        db.scalars(
            select(Notification)
            .where(Notification.user_id == user.id)
            .order_by(desc(Notification.created_at))
            .limit(30)
        )
    )


def mark_notifications_read(db: Session, user: User) -> list[Notification]:
    notifications = list_notifications(db, user)
    now = datetime.now(timezone.utc)
    for item in notifications:
        if item.read_at is None:
            item.read_at = now
    db.commit()
    return notifications
