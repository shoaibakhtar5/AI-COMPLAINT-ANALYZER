from pydantic import BaseModel


class SettingsOut(BaseModel):
    id: str
    user_id: str
    theme: str
    notification_preferences: dict
    ai_preferences: dict
    language: str
    dashboard_layout: str
    workspace_preferences: dict
    integration_preferences: dict

    model_config = {"from_attributes": True}


class SettingsUpdate(BaseModel):
    theme: str | None = None
    notification_preferences: dict | None = None
    ai_preferences: dict | None = None
    language: str | None = None
    dashboard_layout: str | None = None
    workspace_preferences: dict | None = None
    integration_preferences: dict | None = None
