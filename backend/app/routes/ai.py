from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends

from app.ai.predict import predict_complaint
from app.dependencies import get_current_user
from app.models import User
from app.schemas.complaints import PredictionOut


router = APIRouter(tags=["AI Intelligence"])


class PredictRequest(BaseModel):
    complaint_text: str = Field(min_length=6)


class BulkAnalyzeRequest(BaseModel):
    complaints: list[str] = Field(min_length=1)


@router.post("/predict", response_model=PredictionOut)
def predict(payload: PredictRequest, _: User = Depends(get_current_user)):
    return predict_complaint(payload.complaint_text)


@router.post("/bulk-analyze")
def bulk_analyze(payload: BulkAnalyzeRequest, _: User = Depends(get_current_user)):
    return {"items": [predict_complaint(text) for text in payload.complaints]}
