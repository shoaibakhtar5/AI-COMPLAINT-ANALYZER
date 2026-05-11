from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User
from app.schemas.analytics import AnalyticsCharts, AnalyticsSnapshotOut, DashboardSummary
from app.services import analytics as service


router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/dashboard", response_model=DashboardSummary)
def dashboard(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return service.dashboard_summary(db, user)


@router.get("/charts", response_model=AnalyticsCharts)
def charts(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return service.analytics_charts(db, user)


@router.post("/snapshots", response_model=AnalyticsSnapshotOut)
def snapshot(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return service.create_snapshot(db, user)
