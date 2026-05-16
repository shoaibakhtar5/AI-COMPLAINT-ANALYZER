from collections import Counter
from fastapi import APIRouter, Depends, HTTPException

from app.ai.predict import predict_complaint, predict_complaints
from app.ai.preprocess import ComplaintTextError
from app.ai.predictor import AIInferenceTimeoutError
from app.ai.schemas import BulkAnalyzeRequest, BulkAnalyzeResponse, PredictionRequest, PredictionResult
from app.dependencies import get_current_user
from app.models import User


router = APIRouter(tags=["AI Intelligence"])


def _api_prediction(prediction: dict) -> dict:
    return {
        **prediction,
        "confidence": round(float(prediction["confidence"]) / 100, 4),
    }


@router.post("/predict", response_model=PredictionResult)
def predict(payload: PredictionRequest, _: User = Depends(get_current_user)):
    try:
        return _api_prediction(predict_complaint(payload.text))
    except ComplaintTextError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except AIInferenceTimeoutError as exc:
        raise HTTPException(status_code=504, detail=str(exc)) from exc


@router.post("/bulk-analyze", response_model=BulkAnalyzeResponse)
def bulk_analyze(payload: BulkAnalyzeRequest, _: User = Depends(get_current_user)):
    try:
        predictions = predict_complaints(payload.complaints)
    except ComplaintTextError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except AIInferenceTimeoutError as exc:
        raise HTTPException(status_code=504, detail=str(exc)) from exc

    results = [
        {
            "complaint_text": text,
            **_api_prediction(prediction),
        }
        for text, prediction in zip(payload.complaints, predictions, strict=False)
    ]
    priorities = Counter(item["priority"] for item in results)
    sentiments = Counter(item["sentiment"] for item in results)
    statuses = Counter(item["status"] for item in results)
    return {
        "results": results,
        "summary": {
            "total": len(results),
            "high_priority": priorities.get("High", 0) + priorities.get("Critical", 0),
            "negative": sentiments.get("Negative", 0) + sentiments.get("Frustrated", 0),
            "solved": statuses.get("Solved", 0),
        },
    }
