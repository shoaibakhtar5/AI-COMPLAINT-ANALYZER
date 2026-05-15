from dataclasses import dataclass
import inspect
import json
import logging
import os
from functools import lru_cache
from pathlib import Path
from time import perf_counter

from app.ai.labels import normalize_label
from app.config import settings

logger = logging.getLogger("sentra-ai-models")
BACKEND_ROOT = Path(__file__).resolve().parents[2]
HF_CACHE_DIR = BACKEND_ROOT / ".hf-cache"
HF_CACHE_DIR.mkdir(parents=True, exist_ok=True)
os.environ.setdefault("HF_HOME", str(HF_CACHE_DIR))

try:
    import torch
    from transformers import AutoModelForSequenceClassification, AutoTokenizer
except Exception as exc:  # pragma: no cover - exercised when ML deps are absent.
    torch = None
    AutoTokenizer = None
    AutoModelForSequenceClassification = None
    TRANSFORMERS_IMPORT_ERROR = exc
else:
    TRANSFORMERS_IMPORT_ERROR = None


@dataclass
class ModelPrediction:
    label: str
    confidence: float
    raw_label: str


@dataclass
class TransformerBundle:
    task: str
    source: str
    source_type: str
    status: str
    tokenizer: object | None = None
    model: object | None = None
    device: object | None = None
    error: str | None = None
    accepted_inputs: set[str] | None = None

    @property
    def loaded(self) -> bool:
        return self.status == "loaded" and self.tokenizer is not None and self.model is not None

    def predict_batch(self, texts: list[str]) -> list[ModelPrediction] | None:
        if not self.loaded or torch is None:
            return None

        started = perf_counter()
        encoded = self.tokenizer(
            texts,
            truncation=True,
            padding=True,
            max_length=settings.ai_max_length,
            return_tensors="pt",
        )
        if self.accepted_inputs:
            encoded = {key: value for key, value in encoded.items() if key in self.accepted_inputs}
        encoded = {key: value.to(self.device) for key, value in encoded.items()}
        with torch.no_grad():
            logits = self.model(**encoded).logits
            probabilities = torch.softmax(logits, dim=-1)
            confidences, indices = probabilities.max(dim=-1)

        id2label = getattr(self.model.config, "id2label", {}) or {}
        results: list[ModelPrediction] = []
        for index, confidence in zip(indices.tolist(), confidences.tolist(), strict=False):
            raw_label = str(id2label.get(index, id2label.get(str(index), f"LABEL_{index}")))
            results.append(
                ModelPrediction(
                    label=normalize_label(self.task, int(index), raw_label),
                    confidence=round(float(confidence) * 100, 1),
                    raw_label=raw_label,
                )
            )
        logger.info("%s inference completed for %s item(s) in %.1fms", self.task, len(texts), (perf_counter() - started) * 1000)
        return results


def _resolve_model_path(value: str) -> Path:
    path = Path(value)
    return path if path.is_absolute() else BACKEND_ROOT / path


def _has_required_model_files(path: Path) -> bool:
    has_weights = (path / "model.safetensors").exists() or (path / "pytorch_model.bin").exists()
    has_config = (path / "config.json").exists()
    has_tokenizer = any((path / name).exists() for name in ("tokenizer.json", "vocab.txt", "tokenizer.model"))
    return path.exists() and has_weights and has_config and has_tokenizer


def _read_config_labels(task: str, path: Path) -> None:
    config_path = path / "config.json"
    if not config_path.exists():
        return
    try:
        data = json.loads(config_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        logger.warning("%s model config is not valid JSON: %s", task, config_path)
        return

    labels = data.get("id2label") or {}
    normalized = []
    for index, label in labels.items():
        try:
            normalized.append(normalize_label(task, int(index), label))
        except (TypeError, ValueError):
            normalized.append(str(label))
    logger.info("%s model label mapping: %s", task, normalized)


def _log_config_labels(task: str, model: object) -> None:
    labels = getattr(getattr(model, "config", None), "id2label", {}) or {}
    normalized = []
    for index, label in labels.items():
        try:
            normalized.append(normalize_label(task, int(index), label))
        except (TypeError, ValueError):
            normalized.append(str(label))
    if normalized:
        logger.info("%s model label mapping: %s", task, normalized)


def _select_device():
    if torch is None:
        return None
    configured = settings.ai_device.strip().lower()
    if configured == "auto":
        return torch.device("cuda" if torch.cuda.is_available() else "cpu")
    if configured == "cuda" and not torch.cuda.is_available():
        logger.warning("CUDA requested for AI inference but unavailable; falling back to CPU")
        return torch.device("cpu")
    return torch.device(configured)


def _unavailable_bundle(task: str, source: str, source_type: str, error: str) -> TransformerBundle:
    return TransformerBundle(task=task, source=source, source_type=source_type, status="fallback", error=error)


def _load_hugging_face_bundle(task: str, model_id: str, model_subfolder: str = "") -> TransformerBundle:
    subfolder_label = model_subfolder or "repo root"
    logger.info("Loading %s model from Hugging Face repository: %s", task, model_id)
    logger.info("%s Hugging Face model subfolder: %s", task, subfolder_label)
    if TRANSFORMERS_IMPORT_ERROR is not None:
        logger.warning("%s model unavailable: transformers/torch import failed: %s", task, TRANSFORMERS_IMPORT_ERROR)
        return _unavailable_bundle(task, model_id, "huggingface", "transformers or torch is not installed")

    try:
        device = _select_device()
        token = settings.hf_token.strip() if settings.hf_token else None
        tokenizer = AutoTokenizer.from_pretrained(model_id, subfolder=model_subfolder, token=token)
        model = AutoModelForSequenceClassification.from_pretrained(model_id, subfolder=model_subfolder, token=token)
        _log_config_labels(task, model)
        model.to(device)
        model.eval()
        accepted_inputs = set(inspect.signature(model.forward).parameters)
        logger.info("%s model loaded successfully from Hugging Face on %s", task, device)
        return TransformerBundle(
            task=task,
            source=model_id,
            source_type="huggingface",
            status="loaded",
            tokenizer=tokenizer,
            model=model,
            device=device,
            accepted_inputs=accepted_inputs,
        )
    except Exception as exc:
        logger.exception("%s model failed to load from Hugging Face repository %s subfolder %s", task, model_id, subfolder_label)
        return _unavailable_bundle(task, f"{model_id}/{model_subfolder}" if model_subfolder else model_id, "huggingface", str(exc))


def _load_local_bundle(task: str, path_value: str) -> TransformerBundle:
    path = _resolve_model_path(path_value)
    logger.info("Loading %s model from local folder: %s", task, path)
    if TRANSFORMERS_IMPORT_ERROR is not None:
        logger.warning("%s model unavailable: transformers/torch import failed: %s", task, TRANSFORMERS_IMPORT_ERROR)
        return _unavailable_bundle(task, str(path), "local", "transformers or torch is not installed")

    if not _has_required_model_files(path):
        logger.warning("%s model folder missing or incomplete: %s", task, path)
        return _unavailable_bundle(task, str(path), "local", "model folder missing or incomplete")

    try:
        _read_config_labels(task, path)
        device = _select_device()
        tokenizer = AutoTokenizer.from_pretrained(str(path), local_files_only=True)
        model = AutoModelForSequenceClassification.from_pretrained(str(path), local_files_only=True)
        model.to(device)
        model.eval()
        accepted_inputs = set(inspect.signature(model.forward).parameters)
        logger.info("%s model loaded successfully on %s", task, device)
        return TransformerBundle(
            task=task,
            source=str(path),
            source_type="local",
            status="loaded",
            tokenizer=tokenizer,
            model=model,
            device=device,
            accepted_inputs=accepted_inputs,
        )
    except Exception as exc:
        logger.exception("%s model failed to load from %s", task, path)
        return _unavailable_bundle(task, str(path), "local", str(exc))


def load_transformer_bundle(task: str, path_value: str, model_id: str | None = None, model_subfolder: str | None = None) -> TransformerBundle:
    hf_model_id = model_id.strip() if model_id else ""
    hf_subfolder = model_subfolder.strip().strip("/") if model_subfolder else ""
    if hf_model_id:
        hf_bundle = _load_hugging_face_bundle(task, hf_model_id, hf_subfolder)
        if hf_bundle.loaded:
            return hf_bundle
        logger.warning("%s Hugging Face model unavailable; falling back to local folder", task)
        local_bundle = _load_local_bundle(task, path_value)
        if local_bundle.loaded:
            return local_bundle
        return TransformerBundle(
            task=task,
            source=f"huggingface:{hf_bundle.source}; local:{local_bundle.source}",
            source_type="fallback",
            status="fallback",
            error=f"Hugging Face error: {hf_bundle.error}; local error: {local_bundle.error}",
        )
    return _load_local_bundle(task, path_value)


class ModelRegistry:
    def __init__(self) -> None:
        self.category = load_transformer_bundle(
            "category",
            settings.ai_category_model_dir,
            settings.ai_category_model_id,
            settings.ai_category_model_subfolder,
        )
        self.sentiment = load_transformer_bundle(
            "sentiment",
            settings.ai_sentiment_model_dir,
            settings.ai_sentiment_model_id,
            settings.ai_sentiment_model_subfolder,
        )
        self.priority = load_transformer_bundle(
            "priority",
            settings.ai_priority_model_dir,
            settings.ai_priority_model_id,
            settings.ai_priority_model_subfolder,
        )

    def status(self) -> dict[str, str]:
        return {
            "category": self.category.status,
            "sentiment": self.sentiment.status,
            "priority": self.priority.status,
        }


@lru_cache(maxsize=1)
def get_model_registry() -> ModelRegistry:
    return ModelRegistry()


def warmup_models() -> dict[str, str]:
    return get_model_registry().status()
