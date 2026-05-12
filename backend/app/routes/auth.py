from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import settings
from app.core.security import create_access_token, create_refresh_token, decode_token, hash_password, verify_password
from app.database import get_db
from app.dependencies import get_current_user
from app.models import Organization, User
from app.schemas.auth import AuthResponse, LoginRequest, ProfileUpdate, RefreshRequest, SignupRequest, UserOut
from app.services.auth import authenticate, auth_response, create_workspace
from app.services.activity import log_activity


router = APIRouter(prefix="/auth", tags=["Authentication"])


class SecurityUpdate(BaseModel):
    current_password: str | None = None
    new_password: str | None = Field(default=None, min_length=8)
    secret_key: str | None = Field(default=None, min_length=10)


class WorkspaceUpdate(BaseModel):
    company_name: str | None = Field(default=None, min_length=2)
    owner_name: str | None = Field(default=None, min_length=2)
    business_email: str | None = None
    industry: str | None = None
    monthly_volume: str | None = None


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    user = create_workspace(db, payload)
    return auth_response(user)


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate(db, payload)
    return auth_response(user)


@router.post("/refresh")
def refresh(payload: RefreshRequest, db: Session = Depends(get_db)):
    try:
        decoded = decode_token(payload.refresh_token, expected_type="refresh")
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token") from exc

    user = db.scalar(select(User).where(User.id == decoded.get("sub"), User.is_active.is_(True)))
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User session is no longer valid")

    return {
        "access_token": create_access_token(user.id),
        "refresh_token": create_refresh_token(user.id),
        "token_type": "bearer",
    }


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user


@router.patch("/profile", response_model=UserOut)
def update_profile(payload: ProfileUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(user, key, value)
    log_activity(db, user, "profile.updated", "user", user.id, {"fields": sorted(data.keys())})
    db.commit()
    db.refresh(user)
    return user


@router.patch("/security", response_model=UserOut)
def update_security(payload: SecurityUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if payload.new_password:
        if not payload.current_password or not verify_password(payload.current_password, user.password_hash):
            raise HTTPException(status_code=400, detail="Current password is required to update password")
        user.password_hash = hash_password(payload.new_password)

    if payload.secret_key:
        user.secret_key_hash = hash_password(payload.secret_key.upper())

    log_activity(
        db,
        user,
        "auth.security_updated",
        "user",
        user.id,
        {"passwordUpdated": bool(payload.new_password), "secretKeyUpdated": bool(payload.secret_key)},
    )
    db.commit()
    db.refresh(user)
    return user


@router.patch("/workspace", response_model=UserOut)
def update_workspace(payload: WorkspaceUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    organization = db.get(Organization, user.organization_id)
    if not organization:
        raise HTTPException(status_code=404, detail="Organization not found")

    if payload.business_email:
        next_email = payload.business_email.strip().lower()
        existing = db.scalar(select(User).where(User.email == next_email, User.id != user.id))
        if existing:
            raise HTTPException(status_code=409, detail="Business email is already used by another workspace")
        user.email = next_email
        user.username = next_email
        organization.business_email = next_email

    if payload.company_name:
        organization.company_name = payload.company_name.strip()
        user.organization_name = organization.company_name
    if payload.owner_name:
        user.owner_name = payload.owner_name.strip()
    if payload.industry:
        organization.industry = payload.industry
    if payload.monthly_volume:
        organization.monthly_volume = payload.monthly_volume

    log_activity(db, user, "workspace.updated", "organization", organization.id, payload.model_dump(exclude_unset=True))
    db.commit()
    db.refresh(user)
    return user


@router.post("/avatar", response_model=UserOut)
async def upload_avatar(file: UploadFile = File(...), db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in {".png", ".jpg", ".jpeg", ".webp"}:
        raise HTTPException(status_code=400, detail="Avatar must be PNG, JPG, or WEBP")

    settings.ensure_storage_dirs()
    filename = f"{user.id}{suffix}"
    destination = Path(settings.avatar_dir) / filename
    destination.write_bytes(await file.read())
    user.avatar_url = f"/storage/avatars/{filename}"
    log_activity(db, user, "profile.avatar_uploaded", "user", user.id)
    db.commit()
    db.refresh(user)
    return user


@router.post("/logout")
def logout(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    log_activity(db, user, "auth.logout", "user", user.id)
    db.commit()
    return {"ok": True}
