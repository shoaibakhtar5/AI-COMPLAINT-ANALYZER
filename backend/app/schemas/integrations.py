from datetime import datetime
from pydantic import BaseModel


class IntegrationOut(BaseModel):
    id: str
    name: str
    type: str
    status: str
    health: str
    latency: str
    records_today: int
    config: dict
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class IntegrationUpdate(BaseModel):
    status: str | None = None
    health: str | None = None
    latency: str | None = None
    records_today: int | None = None
    config: dict | None = None


class NotificationOut(BaseModel):
    id: str
    title: str
    text: str
    level: str
    read_at: datetime | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
