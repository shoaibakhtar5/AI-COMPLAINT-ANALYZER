from pydantic import BaseModel, Field, model_validator


class PredictionRequest(BaseModel):
    complaint_text: str | None = Field(default=None, min_length=1)
    complaint: str | None = Field(default=None, min_length=1)

    @model_validator(mode="after")
    def require_text(self):
        if not (self.complaint_text or self.complaint):
            raise ValueError("complaint or complaint_text is required")
        return self

    @property
    def text(self) -> str:
        return self.complaint_text or self.complaint or ""


class BulkAnalyzeRequest(BaseModel):
    complaints: list[str] = Field(min_length=1)


class ModelStatus(BaseModel):
    category: str
    sentiment: str
    priority: str


class PredictionResult(BaseModel):
    category: str
    sentiment: str
    priority: str
    confidence: float
    department: str
    explanation: str
    status: str = "Solved"
    model_status: ModelStatus


class BulkPredictionItem(PredictionResult):
    complaint_text: str


class BulkAnalyzeSummary(BaseModel):
    total: int
    high_priority: int
    negative: int
    solved: int


class BulkAnalyzeResponse(BaseModel):
    results: list[BulkPredictionItem]
    summary: BulkAnalyzeSummary
