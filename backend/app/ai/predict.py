from functools import lru_cache
from pathlib import Path
import joblib
from app.config import settings


CATEGORY_DEPARTMENTS = {
    "ATM Issue": "Digital Banking Operations",
    "Card Services": "Card Risk Review",
    "Refund Delay": "Payments Reconciliation",
    "Unauthorized Transaction": "Fraud Operations",
    "App Login": "Mobile Platform Engineering",
    "Support Delay": "Customer Experience",
    "KYC Delay": "Compliance Operations",
    "General Complaint": "Customer Operations",
}


@lru_cache
def load_model_bundle():
    model_path = Path(settings.ai_model_path)
    vectorizer_path = Path(settings.ai_vectorizer_path)
    if model_path.exists() and vectorizer_path.exists():
        return joblib.load(model_path), joblib.load(vectorizer_path)
    return None, None


def _business_classifier(text: str) -> dict:
    lowered = text.lower()
    category = "General Complaint"
    if any(word in lowered for word in ["atm", "cash", "machine"]):
        category = "ATM Issue"
    elif any(word in lowered for word in ["card", "credit", "debit"]):
        category = "Card Services"
    elif any(word in lowered for word in ["refund", "reversal", "failed payment"]):
        category = "Refund Delay"
    elif any(word in lowered for word in ["unauthorized", "fraud", "otp", "stolen", "transaction"]):
        category = "Unauthorized Transaction"
    elif any(word in lowered for word in ["login", "app", "mobile", "password"]):
        category = "App Login"
    elif any(word in lowered for word in ["support", "call", "agent", "ticket"]):
        category = "Support Delay"
    elif any(word in lowered for word in ["kyc", "verification", "documents"]):
        category = "KYC Delay"

    urgency_words = ["urgent", "critical", "fraud", "unauthorized", "stolen", "lawsuit", "angry", "escalate"]
    negative_words = ["not", "failed", "deducted", "delay", "angry", "bad", "blocked", "missing", "unauthorized"]
    urgency_hits = sum(word in lowered for word in urgency_words)
    negative_hits = sum(word in lowered for word in negative_words)
    priority = "Critical" if urgency_hits >= 2 else "High" if urgency_hits or negative_hits >= 2 else "Medium"
    sentiment = "Frustrated" if "angry" in lowered or "support" in lowered else "Negative" if negative_hits else "Neutral"
    confidence = min(97.0, 78.0 + urgency_hits * 4 + negative_hits * 2 + min(len(text) / 80, 8))
    return {
        "category": category,
        "sentiment": sentiment,
        "priority": priority,
        "confidence": round(confidence, 1),
        "department": CATEGORY_DEPARTMENTS.get(category, "Customer Operations"),
        "explanation": f"{category} detected from complaint language with {priority.lower()} operational priority.",
    }


def predict_complaint(text: str) -> dict:
    model, vectorizer = load_model_bundle()
    if model is None or vectorizer is None:
        return _business_classifier(text)

    features = vectorizer.transform([text])
    raw_category = model.predict(features)[0]
    category = str(raw_category)
    confidence = 90.0
    if hasattr(model, "predict_proba"):
        confidence = float(max(model.predict_proba(features)[0]) * 100)

    baseline = _business_classifier(text)
    return {
        "category": category,
        "sentiment": baseline["sentiment"],
        "priority": baseline["priority"],
        "confidence": round(confidence, 1),
        "department": CATEGORY_DEPARTMENTS.get(category, baseline["department"]),
        "explanation": f"Trained complaint model classified this as {category}; routing and urgency were derived from operational rules.",
    }
