from datetime import datetime
from pydantic import BaseModel


class DashboardSummary(BaseModel):
    total: int
    pending: int
    in_progress: int
    analysis_failed: int = 0
    resolved: int
    solved: int
    high_priority: int
    critical: int
    avg_resolution_hours: float
    avg_confidence: float


class AnalyticsCharts(BaseModel):
    monthly_complaint_volume: list[dict]
    complaints_by_category: list[dict]
    sentiment_trend: list[dict]
    resolution_time_trend: list[dict]
    department_load: list[dict]
    source_mix: list[dict]
    priority_distribution: list[dict]
    generated_at: datetime


class AnalyticsSnapshotOut(BaseModel):
    id: str
    total_complaints: int
    resolved_count: int
    urgent_count: int
    avg_resolution_time: float
    sentiment_distribution: dict
    category_distribution: dict
    generated_at: datetime
    organization_id: str

    model_config = {"from_attributes": True}
