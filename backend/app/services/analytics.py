from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import AnalyticsSnapshot, Complaint, User
from app.utils.ids import uuid_str


def _org_filter(user: User):
    return Complaint.organization_id == user.organization_id


def _percent(value: float | None) -> float:
    return round(float(value or 0), 1)


def dashboard_summary(db: Session, user: User) -> dict:
    base = _org_filter(user)
    total = db.scalar(select(func.count()).select_from(Complaint).where(base)) or 0
    pending = db.scalar(select(func.count()).select_from(Complaint).where(base, Complaint.status == "Pending")) or 0
    in_progress = db.scalar(select(func.count()).select_from(Complaint).where(base, Complaint.status == "In Progress")) or 0
    solved = db.scalar(select(func.count()).select_from(Complaint).where(base, Complaint.status == "Solved")) or 0
    high_priority = db.scalar(select(func.count()).select_from(Complaint).where(base, Complaint.priority == "High")) or 0
    critical = db.scalar(select(func.count()).select_from(Complaint).where(base, Complaint.priority == "Critical")) or 0
    avg_resolution = db.scalar(select(func.avg(Complaint.resolution_time_hours)).where(base)) or 0
    avg_confidence = db.scalar(select(func.avg(Complaint.confidence_score)).where(base)) or 0

    return {
        "total": int(total),
        "pending": int(pending),
        "in_progress": int(in_progress),
        "resolved": int(solved),
        "solved": int(solved),
        "high_priority": int(high_priority),
        "critical": int(critical),
        "avg_resolution_hours": _percent(avg_resolution),
        "avg_confidence": _percent(avg_confidence),
    }


def _group_count(db: Session, user: User, column, label: str = "name") -> list[dict]:
    rows = db.execute(
        select(column, func.count(Complaint.id))
        .where(_org_filter(user))
        .group_by(column)
        .order_by(func.count(Complaint.id).desc())
    ).all()
    return [{label: key or "Uncategorized", "value": int(count)} for key, count in rows]


def analytics_charts(db: Session, user: User) -> dict:
    volume_rows = db.execute(
        select(func.date(Complaint.created_at), func.count(Complaint.id))
        .where(_org_filter(user))
        .group_by(func.date(Complaint.created_at))
        .order_by(func.date(Complaint.created_at))
    ).all()
    solved_rows = dict(
        db.execute(
            select(func.date(Complaint.created_at), func.count(Complaint.id))
            .where(_org_filter(user), Complaint.status == "Solved")
            .group_by(func.date(Complaint.created_at))
        ).all()
    )
    volume = [{"month": str(day), "complaints": int(count), "solved": int(solved_rows.get(day, 0))} for day, count in volume_rows]

    sentiment_rows = db.execute(
        select(func.date(Complaint.created_at), Complaint.sentiment, func.count(Complaint.id))
        .where(_org_filter(user))
        .group_by(func.date(Complaint.created_at), Complaint.sentiment)
        .order_by(func.date(Complaint.created_at))
    ).all()
    sentiment_by_day: dict[str, dict] = {}
    for day, sentiment, count in sentiment_rows:
        key = str(day)
        bucket = sentiment_by_day.setdefault(key, {"month": key, "positive": 0, "neutral": 0, "negative": 0})
        bucket[str(sentiment or "neutral").lower()] = int(count)

    resolution_rows = db.execute(
        select(func.date(Complaint.updated_at), func.avg(Complaint.resolution_time_hours))
        .where(_org_filter(user), Complaint.status == "Solved")
        .group_by(func.date(Complaint.updated_at))
        .order_by(func.date(Complaint.updated_at))
    ).all()
    resolution = [{"month": str(day), "hours": _percent(hours)} for day, hours in resolution_rows]

    department = db.execute(
        select(Complaint.department, func.count(Complaint.id), func.avg(Complaint.confidence_score))
        .where(_org_filter(user))
        .group_by(Complaint.department)
        .order_by(func.count(Complaint.id).desc())
    ).all()

    return {
        "monthly_complaint_volume": volume,
        "complaints_by_category": _group_count(db, user, Complaint.category),
        "sentiment_trend": list(sentiment_by_day.values()),
        "resolution_time_trend": resolution,
        "department_load": [
            {"department": name or "Unassigned", "cases": int(count), "confidence": _percent(confidence)}
            for name, count, confidence in department
        ],
        "source_mix": _group_count(db, user, Complaint.source),
        "priority_distribution": _group_count(db, user, Complaint.priority),
        "generated_at": datetime.now(timezone.utc),
    }


def create_snapshot(db: Session, user: User) -> AnalyticsSnapshot:
    summary = dashboard_summary(db, user)
    charts = analytics_charts(db, user)
    snapshot = AnalyticsSnapshot(
        id=uuid_str(),
        organization_id=user.organization_id,
        total_complaints=summary["total"],
        resolved_count=summary["solved"],
        urgent_count=summary["high_priority"] + summary["critical"],
        avg_resolution_time=summary["avg_resolution_hours"],
        sentiment_distribution={item["name"]: item["value"] for item in _group_count(db, user, Complaint.sentiment)},
        category_distribution={item["name"]: item["value"] for item in charts["complaints_by_category"]},
    )
    db.add(snapshot)
    db.commit()
    db.refresh(snapshot)
    return snapshot
