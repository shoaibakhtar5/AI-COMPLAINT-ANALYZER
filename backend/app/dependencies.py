from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import decode_token
from app.database import get_db
from app.models import SuperAdmin, User


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    try:
        payload = decode_token(token, expected_type="access")
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid access token") from exc

    if payload.get("type") != "access":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid access token")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token subject")

    user = db.scalar(select(User).where(User.id == user_id, User.is_active.is_(True)))
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User session is no longer valid")
    return user


def get_current_super_admin(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> SuperAdmin:
    try:
        payload = decode_token(token, expected_type="access")
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid access token") from exc

    if payload.get("type") != "access" or payload.get("role") != "super_admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Super admin permissions required")

    admin_id = payload.get("sub")
    if not admin_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token subject")

    admin = db.scalar(select(SuperAdmin).where(SuperAdmin.id == admin_id, SuperAdmin.is_active.is_(True)))
    if not admin:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Super admin session is no longer valid")
    return admin


def require_admin(user: User = Depends(get_current_user)) -> User:
    role = str(user.role or "").lower().replace(" ", "_")
    if role not in {"owner", "admin", "operations_admin", "workspace_owner"}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin permissions required")
    return user
