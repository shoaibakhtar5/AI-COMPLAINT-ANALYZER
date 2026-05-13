from app.ai.labels import department_for_category


def fallback_category(text: str) -> tuple[str, float]:
    lowered = text.lower()
    category = "General Complaint"
    confidence = 62.0

    rules = [
        ("Product Issue", 88.0, ("product", "item", "damaged", "broken", "defective", "wrong item")),
        ("Delivery Issue", 86.0, ("delivery", "delayed", "late", "shipment", "courier", "tracking")),
        ("Billing Issue", 86.0, ("billing", "charged twice", "invoice", "amount", "subscription", "payment")),
        ("Refund Issue", 84.0, ("refund", "reversal", "money back", "not received", "return")),
        ("Technical Support", 86.0, ("login", "password", "app", "crashing", "bug", "not working")),
        ("Customer Service", 82.0, ("support", "agent", "ticket", "callback", "not responding")),
        ("Account Issue", 80.0, ("account", "access", "profile", "verification", "locked")),
        ("Service Delay", 78.0, ("pending", "waiting", "service request", "delay", "slow")),
    ]
    for label, score, keywords in rules:
        if any(keyword in lowered for keyword in keywords):
            category = label
            confidence = score
            break

    return category, confidence


def fallback_sentiment(text: str) -> tuple[str, float]:
    lowered = text.lower()
    negative_words = ("not", "failed", "delay", "damaged", "missing", "incorrect", "angry", "bad", "broken")
    positive_words = ("thanks", "solved", "good", "helpful", "satisfied")
    negative_hits = sum(word in lowered for word in negative_words)
    positive_hits = sum(word in lowered for word in positive_words)

    if negative_hits >= 2 or any(word in lowered for word in ("angry", "frustrated", "urgent")):
        return "Frustrated", min(90.0, 74.0 + negative_hits * 4)
    if negative_hits:
        return "Negative", min(86.0, 72.0 + negative_hits * 4)
    if positive_hits:
        return "Positive", min(84.0, 70.0 + positive_hits * 5)
    return "Neutral", 68.0


def fallback_priority(text: str, category: str, sentiment: str) -> tuple[str, float]:
    lowered = text.lower()
    critical_words = ("critical", "lawsuit", "unsafe", "data leak", "escalate", "major outage")
    high_words = ("urgent", "charged twice", "damaged", "blocked", "failed", "missing", "cannot", "not working")
    critical_hits = sum(word in lowered for word in critical_words)
    high_hits = sum(word in lowered for word in high_words)

    if critical_hits:
        return "Critical", min(94.0, 84.0 + critical_hits * 4)
    if sentiment in {"Frustrated", "Negative"} and high_hits:
        return "High", min(90.0, 78.0 + high_hits * 3)
    if high_hits:
        return "Medium", min(82.0, 70.0 + high_hits * 3)
    return "Low", 66.0


def fallback_prediction(text: str) -> dict:
    category, category_confidence = fallback_category(text)
    sentiment, sentiment_confidence = fallback_sentiment(text)
    priority, priority_confidence = fallback_priority(text, category, sentiment)
    confidence = round(max(category_confidence, sentiment_confidence, priority_confidence), 1)
    return {
        "category": category,
        "sentiment": sentiment,
        "priority": priority,
        "confidence": confidence,
        "department": department_for_category(category),
        "explanation": f"{category} detected from complaint language with {priority.lower()} operational priority.",
    }
