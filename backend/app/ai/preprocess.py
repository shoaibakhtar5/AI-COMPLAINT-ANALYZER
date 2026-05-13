import re


class ComplaintTextError(ValueError):
    pass


def normalize_complaint_text(text: str, min_length: int = 6, max_chars: int = 8000) -> str:
    cleaned = re.sub(r"\s+", " ", str(text or "")).strip()
    if not cleaned:
        raise ComplaintTextError("Complaint text is required")
    if len(cleaned) < min_length:
        raise ComplaintTextError(f"Complaint text must be at least {min_length} characters")
    if len(cleaned) > max_chars:
        cleaned = cleaned[:max_chars].rsplit(" ", 1)[0].strip() or cleaned[:max_chars]
    return cleaned
