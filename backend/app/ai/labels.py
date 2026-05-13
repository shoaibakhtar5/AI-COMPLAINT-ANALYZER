# Update these maps if the training notebook used a different label order.
CATEGORY_LABELS = {
    0: "Product Issue",
    1: "Delivery Issue",
    2: "Billing Issue",
    3: "Refund Issue",
    4: "Technical Support",
    5: "Customer Service",
    6: "Account Issue",
    7: "Service Delay",
    8: "General Complaint",
}

SENTIMENT_LABELS = {
    0: "Negative",
    1: "Neutral",
    2: "Positive",
}

PRIORITY_LABELS = {
    0: "Low",
    1: "Medium",
    2: "High",
}

CATEGORY_DEPARTMENTS = {
    "Product Issue": "Product Support",
    "Delivery Issue": "Logistics Support",
    "Billing Issue": "Billing Department",
    "Refund Issue": "Payments & Refunds",
    "Technical Support": "Technical Support Team",
    "Customer Service": "Customer Experience",
    "Account Issue": "Account Management",
    "Service Delay": "Operations Team",
    "Quality Complaint": "Quality Assurance",
    "General Complaint": "Customer Operations",
}

TASK_FALLBACK_LABELS = {
    "category": CATEGORY_LABELS,
    "sentiment": SENTIMENT_LABELS,
    "priority": PRIORITY_LABELS,
}


def is_generic_label(label: str | None) -> bool:
    if not label:
        return True
    normalized = str(label).strip().upper()
    return normalized.startswith("LABEL_") or normalized.isdigit()


def normalize_label(task: str, index: int, raw_label: str | None = None) -> str:
    if raw_label and not is_generic_label(raw_label):
        cleaned = str(raw_label).strip()
        if task == "category" and cleaned not in CATEGORY_DEPARTMENTS:
            return CATEGORY_LABELS.get(index, "General Complaint")
        return cleaned
    return TASK_FALLBACK_LABELS.get(task, {}).get(index, raw_label or f"Label {index}")


def department_for_category(category: str) -> str:
    return CATEGORY_DEPARTMENTS.get(category, "Customer Operations")
