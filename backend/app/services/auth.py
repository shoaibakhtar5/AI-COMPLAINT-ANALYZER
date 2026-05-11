from datetime import datetime
from sqlalchemy import or_, select
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.core.security import create_access_token, create_refresh_token, hash_password, verify_password
from app.models import Integration, Notification, Organization, User, UserSetting
from app.schemas.auth import LoginRequest, SignupRequest
from app.services.activity import log_activity


DEFAULT_INTEGRATIONS = [
    ("Website Form", "Webhook", "Connected", "Healthy", "42ms", 218),
    ("Mobile App", "SDK", "Active", "Healthy", "58ms", 142),
    ("CRM System", "REST API", "Pending", "Review Needed", "N/A", 0),
    ("Support Inbox", "Email Parser", "Connected", "Healthy", "71ms", 94),
    ("Public API", "REST API", "Disconnected", "Paused", "N/A", 0),
]


def create_workspace(db: Session, payload: SignupRequest):
    existing = db.scalar(select(User).where(User.email == payload.business_email.lower()))
    if existing:
        raise HTTPException(status_code=409, detail="A workspace already exists for this email.")

    organization = Organization(
        company_name=payload.company_name.strip(),
        industry=payload.industry,
        monthly_volume=payload.monthly_volume,
        business_email=payload.business_email.lower(),
    )
    db.add(organization)
    db.flush()

    user = User(
        organization_id=organization.id,
        organization_name=organization.company_name,
        owner_name=payload.owner_name.strip(),
        email=payload.business_email.lower(),
        username=payload.business_email.lower(),
        password_hash=hash_password(payload.password),
        secret_key_hash=hash_password(payload.secret_key.upper()),
        role=payload.role,
    )
    db.add(user)
    db.flush()

    db.add(UserSetting(
        user_id=user.id,
        notification_preferences={"emailAlerts": True, "criticalAlerts": True, "escalationAlerts": True, "weeklyDigest": False},
        ai_preferences={"classifierMode": "Balanced automation", "sentimentSensitivity": 72, "autoPriority": True, "humanReview": True},
        workspace_preferences={"compactTables": True},
        integration_preferences={"crmConnected": False},
    ))

    for name, kind, status_value, health, latency, records in DEFAULT_INTEGRATIONS:
        db.add(Integration(
            organization_id=organization.id,
            name=name,
            type=kind,
            status=status_value,
            health=health,
            latency=latency,
            records_today=records,
            config={"webhook": f"https://api.sentra.local/intake/{name.lower().replace(' ', '-')}"},
        ))

    db.add(Notification(
        organization_id=organization.id,
        user_id=user.id,
        title="Workspace created",
        text="Your Sentra AI workspace is ready for complaint intelligence workflows.",
        level="success",
    ))
    log_activity(db, user, "workspace.created", "organization", organization.id)
    db.commit()
    db.refresh(user)
    return user


def authenticate(db: Session, payload: LoginRequest):
    login_id = payload.username_or_email.strip().lower()
    user = db.scalar(select(User).where(or_(User.email == login_id, User.username == login_id)))
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Workspace not found.")
    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect password.")
    if not verify_password(payload.secret_key.upper(), user.secret_key_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid company secret key.")
    user.last_login = datetime.utcnow()
    log_activity(db, user, "auth.login", "user", user.id)
    db.commit()
    db.refresh(user)
    return user


def auth_response(user: User):
    return {
        "access_token": create_access_token(user.id),
        "refresh_token": create_refresh_token(user.id),
        "token_type": "bearer",
        "user": user,
        "company": user.organization_name,
    }
