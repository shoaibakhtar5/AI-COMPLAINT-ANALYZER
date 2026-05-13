from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class PredictionOut(BaseModel):
    category: str
    sentiment: str
    priority: str
    confidence: float
    department: str
    explanation: str
    status: str = "Solved"
    model_status: dict[str, str] | None = None


class ComplaintCreate(BaseModel):
    customer_name: str = Field(min_length=2)
    customer_email: EmailStr | None = None
    complaint_text: str = Field(min_length=6)
    category: str | None = None
    department: str | None = None
    source: str = "Portal"
    status: str = "Solved"
    priority: str | None = None
    sentiment: str | None = None
    assignee: str = "Unassigned"
    notes: str | None = None


class ComplaintUpdate(BaseModel):
    customer_name: str | None = None
    customer_email: EmailStr | None = None
    complaint_text: str | None = None
    category: str | None = None
    sentiment: str | None = None
    priority: str | None = None
    status: str | None = None
    department: str | None = None
    source: str | None = None
    assignee: str | None = None
    notes: str | None = None
    resolution_time_hours: float | None = None


class ComplaintOut(BaseModel):
    id: str
    complaint_text: str
    customer_name: str
    customer_email: str | None = None
    category: str
    sentiment: str
    priority: str
    confidence_score: float
    ai_explanation: str | None = None
    status: str
    department: str
    source: str
    created_at: datetime
    updated_at: datetime
    organization_id: str
    uploaded_by: str | None = None
    bulk_upload_id: str | None = None
    assignee: str
    notes: str | None = None
    resolution_time_hours: float | None = None

    model_config = {"from_attributes": True}


class ComplaintListResponse(BaseModel):
    items: list[ComplaintOut]
    total: int
    page: int
    page_size: int
    pages: int
