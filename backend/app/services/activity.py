from sqlalchemy.orm import Session
from app.models import ActivityLog, User


def log_activity(db: Session, user: User | None, action: str, entity_type: str, entity_id: str | None = None, metadata: dict | None = None):
    entry = ActivityLog(
        user_id=user.id if user else None,
        organization_id=user.organization_id if user else None,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        details=metadata or {},
    )
    db.add(entry)
    return entry
