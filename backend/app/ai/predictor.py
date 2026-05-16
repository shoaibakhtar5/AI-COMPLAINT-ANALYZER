from concurrent.futures import ThreadPoolExecutor, TimeoutError as FutureTimeoutError
import logging
from threading import Lock
from time import perf_counter

from app.ai.fallback import fallback_prediction, fallback_priority, fallback_sentiment
from app.ai.labels import department_for_category
from app.ai.model_loader import get_model_registry
from app.ai.preprocess import normalize_complaint_text

logger = logging.getLogger("sentra-ai-predictor")
_INFERENCE_EXECUTOR = ThreadPoolExecutor(max_workers=1, thread_name_prefix="sentra-ai-inference")
_PREDICTOR: "ComplaintPredictor | None" = None
_PREDICTOR_LOCK = Lock()
_INFERENCE_BATCH_SIZE = 8
_REQUEST_TIMEOUT_SECONDS = 18.0


class AIInferenceTimeoutError(RuntimeError):
    """Raised when an AI prediction takes longer than the backend request budget."""


def _status_with_fallbacks(status: dict[str, str]) -> dict[str, str]:
    return {key: ("loaded" if value == "loaded" else "fallback") for key, value in status.items()}


class ComplaintPredictor:
    def __init__(self) -> None:
        self.registry = get_model_registry()

    @staticmethod
    def _chunks(texts: list[str]) -> list[list[str]]:
        size = max(1, _INFERENCE_BATCH_SIZE)
        return [texts[index:index + size] for index in range(0, len(texts), size)]

    def _predict_task(self, task: str, texts: list[str]):
        bundle = getattr(self.registry, task)
        if not bundle.loaded:
            logger.info("AI %s inference skipped; model status=%s", task, bundle.status)
            return None

        started = perf_counter()
        predictions = []
        for chunk in self._chunks(texts):
            batch = bundle.predict_batch(chunk)
            if batch is None:
                return None
            predictions.extend(batch)
        logger.info(
            "AI %s total inference time: %.1fms for %s item(s)",
            task,
            (perf_counter() - started) * 1000,
            len(texts),
        )
        return predictions

    def predict_many(self, texts: list[str]) -> list[dict]:
        cleaned = [normalize_complaint_text(text) for text in texts]
        started = perf_counter()

        base_predictions = [fallback_prediction(text) for text in cleaned]
        category_predictions = self._predict_task("category", cleaned)
        sentiment_predictions = self._predict_task("sentiment", cleaned)
        priority_predictions = self._predict_task("priority", cleaned)
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

        logger.info("AI analysis total time: %.1fms for %s complaint(s)", (perf_counter() - started) * 1000, len(cleaned))
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


def get_predictor() -> ComplaintPredictor:
    global _PREDICTOR
    if _PREDICTOR is None:
        with _PREDICTOR_LOCK:
            if _PREDICTOR is None:
                logger.info("Initializing AI complaint predictor")
                _PREDICTOR = ComplaintPredictor()
    return _PREDICTOR


def _run_with_timeout(label: str, fn):
    future = _INFERENCE_EXECUTOR.submit(fn)
    try:
        return future.result(timeout=_REQUEST_TIMEOUT_SECONDS)
    except FutureTimeoutError as exc:
        future.cancel()
        logger.error("%s exceeded %.1fs request timeout", label, _REQUEST_TIMEOUT_SECONDS)
        raise AIInferenceTimeoutError(
            "AI analysis is taking longer than expected. Please retry with a shorter request or smaller batch."
        ) from exc
    except Exception:
        logger.exception("%s failed during AI inference", label)
        raise


def predict_complaint(text: str) -> dict:
    return _run_with_timeout("Single complaint prediction", lambda: get_predictor().predict_one(text))


def predict_complaints(texts: list[str]) -> list[dict]:
    return _run_with_timeout("Bulk complaint prediction", lambda: get_predictor().predict_many(texts))
