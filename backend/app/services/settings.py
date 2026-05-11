from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import User, UserSetting
from app.schemas.settings import SettingsUpdate
from app.services.activity import log_activity
from app.utils.ids import uuid_str


DEFAULT_SETTINGS = {
    "theme": "dark",
    "notification_preferences": {
        "emailAlerts": True,
        "criticalAlerts": True,
        "escalationAlerts": True,
        "weeklyDigest": False,
    },
    "ai_preferences": {
        "classifierMode": "balanced",
        "sentimentSensitivity": 72,
        "autoPriorityRouting": True,
        "modelStatus": "active",
    },
    "language": "English",
    "dashboard_layout": "executive",
    "workspace_preferences": {
        "density": "comfortable",
        "timeZone": "Asia/Karachi",
        "dateFormat": "DD MMM YYYY",
    },
    "integration_preferences": {
        "webhooks": True,
        "apiAccess": True,
        "crmSync": False,
    },
}


def get_or_create_settings(db: Session, user: User) -> UserSetting:
    setting = db.scalar(select(UserSetting).where(UserSetting.user_id == user.id))
    if setting:
        return setting

    setting = UserSetting(id=uuid_str(), user_id=user.id, **DEFAULT_SETTINGS)
    db.add(setting)
    db.commit()
    db.refresh(setting)
    return setting


def update_settings(db: Session, user: User, payload: SettingsUpdate) -> UserSetting:
    setting = get_or_create_settings(db, user)
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(setting, key, value)
    log_activity(db, user, "updated settings", "settings", setting.id, {"fields": sorted(data.keys())})
    db.commit()
    db.refresh(setting)
    return setting
