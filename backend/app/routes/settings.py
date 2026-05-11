from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User
from app.schemas.settings import SettingsOut, SettingsUpdate
from app.services import settings as service


router = APIRouter(prefix="/settings", tags=["Settings"])


@router.get("", response_model=SettingsOut)
def get_settings(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return service.get_or_create_settings(db, user)


@router.patch("", response_model=SettingsOut)
def patch_settings(payload: SettingsUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return service.update_settings(db, user, payload)
