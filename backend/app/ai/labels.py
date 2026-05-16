# These fallback maps are used when Hugging Face config labels are generic
# (LABEL_0, LABEL_1, ...). They must match the exact training label order in
# model_notebook/complaint_analyzer.ipynb. Do not alphabetize or "clean up" the
# order unless the training/export code changes.
#
# Category model source:
# ALL_CATEGORIES = [
#   "billing", "shipping", "product_quality", "customer_service",
#   "technical_support", "account_access", "refund_request",
#   "safety_issue", "order_status",
# ]
CATEGORY_LABELS = {
    0: "Billing Issue",
    1: "Delivery Issue",
    2: "Product Issue",
    3: "Customer Service",
    4: "Technical Support",
    5: "Account Issue",
    6: "Refund Issue",
    7: "Safety Issue",
    8: "Order Status",
}

# Sentiment model source:
# LabelEncoder().fit_transform(df["sentiment"]) with classes_:
# ["negative", "neutral", "positive"]
SENTIMENT_LABELS = {
    0: "Negative",
    1: "Neutral",
    2: "Positive",
}

# Priority/urgency model source:
# LabelEncoder().fit_transform(df["urgency"]) with classes_:
# ["high", "low", "medium"]
PRIORITY_LABELS = {
    0: "High",
    1: "Low",
    2: "Medium",
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
    "Safety Issue": "Quality Assurance",
    "Order Status": "Customer Operations",
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
