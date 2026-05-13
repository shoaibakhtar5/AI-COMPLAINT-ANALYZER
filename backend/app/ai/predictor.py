import logging
from time import perf_counter

from app.ai.fallback import fallback_prediction, fallback_priority, fallback_sentiment
from app.ai.labels import department_for_category
from app.ai.model_loader import get_model_registry
from app.ai.preprocess import normalize_complaint_text

logger = logging.getLogger("sentra-ai-predictor")


def _status_with_fallbacks(status: dict[str, str]) -> dict[str, str]:
    return {key: ("loaded" if value == "loaded" else "fallback") for key, value in status.items()}


class ComplaintPredictor:
    def __init__(self) -> None:
        self.registry = get_model_registry()

    def predict_many(self, texts: list[str]) -> list[dict]:
        cleaned = [normalize_complaint_text(text) for text in texts]
        started = perf_counter()

        base_predictions = [fallback_prediction(text) for text in cleaned]
        category_predictions = self.registry.category.predict_batch(cleaned)
        sentiment_predictions = self.registry.sentiment.predict_batch(cleaned)
        priority_predictions = self.registry.priority.predict_batch(cleaned)
        model_status = _status_with_fallbacks(self.registry.status())

        results: list[dict] = []
        for index, text in enumerate(cleaned):
            base = base_predictions[index]
            category = category_predictions[index].label if category_predictions else base["category"]
            sentiment = sentiment_predictions[index].label if sentiment_predictions else fallback_sentiment(text)[0]
            priority = priority_predictions[index].label if priority_predictions else fallback_priority(text, category, sentiment)[0]

            confidences = [
                prediction[index].confidence
                for prediction in (category_predictions, sentiment_predictions, priority_predictions)
                if prediction is not None
            ]
            confidence = round(sum(confidences) / len(confidences), 1) if confidences else base["confidence"]

            results.append(
                {
                    "category": category,
                    "sentiment": sentiment,
                    "priority": priority,
                    "confidence": confidence,
                    "department": department_for_category(category),
                    "explanation": self._explanation(category, sentiment, priority, model_status),
                    "status": "Solved",
                    "model_status": model_status,
                }
            )

        logger.info("Prediction completed for %s complaint(s) in %.1fms", len(cleaned), (perf_counter() - started) * 1000)
        return results

    def predict_one(self, text: str) -> dict:
        return self.predict_many([text])[0]

    @staticmethod
    def _explanation(category: str, sentiment: str, priority: str, model_status: dict[str, str]) -> str:
        loaded = [name for name, status in model_status.items() if status == "loaded"]
        fallback = [name for name, status in model_status.items() if status != "loaded"]
        loaded_text = ", ".join(loaded) if loaded else "rule-based"
        fallback_text = f" Fallback used for {', '.join(fallback)}." if fallback else ""
        return (
            f"The complaint was classified as {category} with {sentiment.lower()} sentiment "
            f"and {priority.lower()} priority using {loaded_text} inference.{fallback_text}"
        )


_predictor: ComplaintPredictor | None = None


def get_predictor() -> ComplaintPredictor:
    global _predictor
    if _predictor is None:
        _predictor = ComplaintPredictor()
    return _predictor


def predict_complaint(text: str) -> dict:
    return get_predictor().predict_one(text)


def predict_complaints(texts: list[str]) -> list[dict]:
    return get_predictor().predict_many(texts)
