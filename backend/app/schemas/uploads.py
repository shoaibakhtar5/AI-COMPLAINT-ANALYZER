from datetime import datetime
from pydantic import BaseModel
from app.schemas.complaints import ComplaintOut


class BulkUploadOut(BaseModel):
    id: str
    file_name: str
    upload_status: str
    total_rows: int
    processed_rows: int
    failed_rows: int
    upload_timestamp: datetime
    uploaded_by: str | None
    organization_id: str
    analysis_summary: dict
    processing_logs: list

    model_config = {"from_attributes": True}


class BulkUploadDetail(BulkUploadOut):
    complaints: list[ComplaintOut]
