from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy import String, and_, cast, desc, func, or_, select
from sqlalchemy.orm import Session

from app.core.security import create_access_token, create_refresh_token, hash_password, verify_password
from app.models import ActivityLog, BulkUpload, Complaint, Organization, SuperAdmin, User
from app.schemas.super_admin import (
    CompanyStatusUpdate,
    SuperAdminCreate,
    SuperAdminLoginRequest,
    SuperAdminPasswordUpdate,
    SuperAdminProfileUpdate,
    SuperAdminSettingsUpdate,
)


DEFAULT_SUPER_ADMIN = {
    "username": "superadmin",
    "email": "superadmin@sentra.ai",
    "display_name": "Platform Super Admin",
    "password": "superadmin123",
}

SUPER_ADMIN_THEMES = {"warm", "obsidian", "pro-dark"}


def log_platform_activity(db: Session, admin: SuperAdmin | None, action: str, entity_type: str, entity_id: str | None = None, metadata: dict | None = None):
    entry = ActivityLog(
        user_id=None,
        organization_id=None,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        details={"super_admin_id": admin.id if admin else None, **(metadata or {})},
    )
    db.add(entry)
    return entry


def seed_default_super_admin(db: Session) -> SuperAdmin | None:
    existing = db.scalar(select(SuperAdmin).limit(1))
    if existing:
        return None

    admin = SuperAdmin(
        username=DEFAULT_SUPER_ADMIN["username"],
        email=DEFAULT_SUPER_ADMIN["email"],
        display_name=DEFAULT_SUPER_ADMIN["display_name"],
        password_hash=hash_password(DEFAULT_SUPER_ADMIN["password"]),
        role="super_admin",
        is_active=True,
        theme="warm",
    )
    db.add(admin)
    db.flush()
    log_platform_activity(db, admin, "super_admin.seeded", "super_admin", admin.id, {"username": admin.username})
    db.commit()
    db.refresh(admin)
    return admin


def authenticate_super_admin(db: Session, payload: SuperAdminLoginRequest) -> dict:
    login_id = payload.username_or_email.strip().lower()
    admin = db.scalar(select(SuperAdmin).where(or_(SuperAdmin.email == login_id, SuperAdmin.username == login_id)))
    if not admin or not admin.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Super admin account not found or disabled.")
    if not verify_password(payload.password, admin.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect password.")

    admin.last_login = datetime.utcnow()
    log_platform_activity(db, admin, "super_admin.login", "super_admin", admin.id)
    db.commit()
    db.refresh(admin)
    token_claims = {"role": "super_admin", "scope": "platform"}
    return {
        "access_token": create_access_token(admin.id, token_claims),
        "refresh_token": create_refresh_token(admin.id, token_claims),
        "token_type": "bearer",
        "admin": admin,
    }


def _count(db: Session, model, *conditions) -> int:
    return int(db.scalar(select(func.count()).select_from(model).where(*conditions)) or 0)


def _visible_organization_ids():
    return select(Organization.id).where(Organization.status != "Deleted")


def _owner_for_org(db: Session, organization_id: str) -> User | None:
    return db.scalar(
        select(User)
        .where(User.organization_id == organization_id)
        .order_by(User.created_at.asc())
        .limit(1)
    )


def serialize_company(db: Session, organization: Organization) -> dict:
    owner = _owner_for_org(db, organization.id)
    return {
        "id": organization.id,
        "company_name": organization.company_name,
        "business_email": organization.business_email,
        "industry": organization.industry,
        "monthly_volume": organization.monthly_volume,
        "owner_name": owner.owner_name if owner else None,
        "users_count": _count(db, User, User.organization_id == organization.id),
        "complaints_count": _count(db, Complaint, Complaint.organization_id == organization.id),
        "analyses_count": _count(
            db,
            Complaint,
            Complaint.organization_id == organization.id,
            or_(Complaint.status == "Solved", Complaint.analyzed_at.is_not(None)),
        ),
        "uploads_count": _count(db, BulkUpload, BulkUpload.organization_id == organization.id),
        "status": organization.status or "Active",
        "created_at": organization.created_at,
        "suspended_at": organization.suspended_at,
        "suspended_reason": organization.suspended_reason,
    }


def dashboard(db: Session) -> dict:
    visible_company = Organization.status != "Deleted"
    visible_org_ids = _visible_organization_ids()
    companies = _count(db, Organization, visible_company)
    active = _count(db, Organization, Organization.status == "Active")
    suspended = _count(db, Organization, Organization.status == "Suspended")
    users = _count(db, User, User.organization_id.in_(visible_org_ids))
    complaints = _count(db, Complaint, Complaint.organization_id.in_(visible_org_ids))
    analyses = _count(
        db,
        Complaint,
        Complaint.organization_id.in_(visible_org_ids),
        or_(Complaint.status == "Solved", Complaint.analyzed_at.is_not(None)),
    )
    uploads = _count(db, BulkUpload, BulkUpload.organization_id.in_(visible_org_ids))
    recent_companies = db.scalars(
        select(Organization)
        .where(visible_company)
        .order_by(desc(Organization.created_at))
        .limit(8)
    ).all()
    activity = db.scalars(select(ActivityLog).order_by(desc(ActivityLog.timestamp)).limit(6)).all()
    return {
        "summary": {
            "total_companies": companies,
            "active_companies": active,
            "suspended_companies": suspended,
            "total_users": users,
            "total_complaints": complaints,
            "total_ai_analyses": analyses,
            "total_bulk_uploads": uploads,
        },
        "recent_companies": [serialize_company(db, org) for org in recent_companies],
        "activity": [serialize_activity(row) for row in activity],
    }


def list_companies(db: Session, q: str | None = None, status_value: str | None = None) -> list[dict]:
    conditions = [Organization.status != "Deleted"]
    if q:
        search = f"%{q.strip().lower()}%"
        conditions.append(or_(
            func.lower(Organization.company_name).like(search),
            func.lower(Organization.business_email).like(search),
            func.lower(Organization.industry).like(search),
            Organization.id.in_(
                select(User.organization_id).where(or_(
                    func.lower(User.owner_name).like(search),
                    func.lower(User.email).like(search),
                ))
            ),
        ))
    if status_value:
        normalized_status = status_value.strip().lower()
        status_map = {"active": "Active", "suspended": "Suspended"}
        conditions.append(Organization.status == status_map.get(normalized_status, status_value))

    query = select(Organization)
    if conditions:
        query = query.where(and_(*conditions))
    rows = db.scalars(query.order_by(desc(Organization.created_at))).all()
    return [serialize_company(db, org) for org in rows]


def get_company_detail(db: Session, organization_id: str) -> dict:
    organization = db.get(Organization, organization_id)
    if not organization:
        raise LookupError("Company not found")
    users = db.scalars(select(User).where(User.organization_id == organization_id).order_by(User.created_at.asc())).all()
    recent_activity = db.scalars(
        select(ActivityLog)
        .where(ActivityLog.organization_id == organization_id)
        .order_by(desc(ActivityLog.timestamp))
        .limit(12)
    ).all()
    return {
        "company": serialize_company(db, organization),
        "users": [serialize_user(user) for user in users],
        "analytics": {
            "complaints_count": _count(db, Complaint, Complaint.organization_id == organization_id),
            "solved_count": _count(db, Complaint, Complaint.organization_id == organization_id, Complaint.status == "Solved"),
            "pending_count": _count(db, Complaint, Complaint.organization_id == organization_id, Complaint.status == "Pending Analysis"),
            "failed_count": _count(db, Complaint, Complaint.organization_id == organization_id, Complaint.status == "Analysis Failed"),
            "uploads_count": _count(db, BulkUpload, BulkUpload.organization_id == organization_id),
        },
        "recent_activity": [serialize_activity(row) for row in recent_activity],
    }


def suspend_company(db: Session, admin: SuperAdmin, organization_id: str, payload: CompanyStatusUpdate) -> dict:
    organization = db.get(Organization, organization_id)
    if not organization:
        raise LookupError("Company not found")
    if organization.status == "Deleted":
        raise HTTPException(status_code=400, detail="Deleted companies cannot be suspended.")
    organization.status = "Suspended"
    organization.suspended_at = datetime.utcnow()
    organization.suspended_reason = payload.reason or "Suspended by platform admin"
    log_platform_activity(db, admin, "company.suspended", "organization", organization.id, {"reason": organization.suspended_reason})
    db.commit()
    db.refresh(organization)
    return serialize_company(db, organization)


def reactivate_company(db: Session, admin: SuperAdmin, organization_id: str) -> dict:
    organization = db.get(Organization, organization_id)
    if not organization:
        raise LookupError("Company not found")
    if organization.status == "Deleted":
        raise HTTPException(status_code=400, detail="Deleted companies cannot be reactivated.")
    organization.status = "Active"
    organization.suspended_at = None
    organization.suspended_reason = None
    log_platform_activity(db, admin, "company.reactivated", "organization", organization.id)
    db.commit()
    db.refresh(organization)
    return serialize_company(db, organization)


def delete_company(db: Session, admin: SuperAdmin, organization_id: str, confirmation: str) -> dict:
    organization = db.get(Organization, organization_id)
    if not organization:
        raise LookupError("Company not found")
    expected = f"DELETE {organization.company_name}"
    if confirmation not in {expected, organization.company_name}:
        raise HTTPException(status_code=400, detail=f'Type "{organization.company_name}" to delete this company.')
    details = {"company_name": organization.company_name, "business_email": organization.business_email}
    log_platform_activity(db, admin, "company.deleted", "organization", organization.id, details)
    organization.status = "Deleted"
    organization.suspended_at = datetime.utcnow()
    organization.suspended_reason = "Deleted by platform admin"
    users = db.scalars(select(User).where(User.organization_id == organization.id)).all()
    for user in users:
        user.is_active = False
    db.commit()
    return {"ok": True, "id": organization_id, "status": "Deleted"}


def serialize_user(user: User) -> dict:
    organization = user.organization
    status_value = "Active" if user.is_active else "Inactive"
    if organization and organization.status == "Suspended":
        status_value = "Workspace Suspended"
    return {
        "id": user.id,
        "owner_name": user.owner_name,
        "email": user.email,
        "username": user.username,
        "company": user.organization_name,
        "organization_id": user.organization_id,
        "role": user.role,
        "status": status_value,
        "is_active": user.is_active,
        "created_at": user.created_at,
        "last_login": user.last_login,
    }


def list_users(db: Session, q: str | None = None, status_value: str | None = None) -> list[dict]:
    conditions = [User.organization_id.in_(_visible_organization_ids())]
    if q:
        search = f"%{q.strip().lower()}%"
        conditions.append(or_(
            func.lower(User.owner_name).like(search),
            func.lower(User.email).like(search),
            func.lower(User.organization_name).like(search),
            func.lower(User.role).like(search),
        ))
    if status_value == "Active":
        conditions.append(User.is_active.is_(True))
    elif status_value == "Inactive":
        conditions.append(User.is_active.is_(False))

    query = select(User)
    if conditions:
        query = query.where(and_(*conditions))
    rows = db.scalars(query.order_by(desc(User.created_at))).all()
    return [serialize_user(user) for user in rows]


def set_user_active(db: Session, admin: SuperAdmin, user_id: str, active: bool) -> dict:
    user = db.get(User, user_id)
    if not user:
        raise LookupError("User not found")
    user.is_active = active
    action = "user.activated" if active else "user.deactivated"
    log_platform_activity(db, admin, action, "user", user.id, {"email": user.email, "organization_id": user.organization_id})
    db.commit()
    db.refresh(user)
    return serialize_user(user)


def serialize_activity(row: ActivityLog) -> dict:
    return {
        "id": row.id,
        "action": row.action,
        "entity_type": row.entity_type,
        "entity_id": row.entity_id,
        "timestamp": row.timestamp,
        "metadata": row.details,
    }


def global_search(db: Session, q: str) -> dict:
    term = q.strip()
    if len(term) < 2:
        return {"companies": [], "users": [], "activity": []}

    search = f"%{term.lower()}%"
    visible_org_ids = _visible_organization_ids()
    company_owner_matches = select(User.organization_id).where(or_(
        func.lower(User.owner_name).like(search),
        func.lower(User.email).like(search),
    ))
    companies = db.scalars(
        select(Organization)
        .where(
            Organization.status != "Deleted",
            or_(
                func.lower(Organization.company_name).like(search),
                func.lower(Organization.business_email).like(search),
                func.lower(Organization.industry).like(search),
                Organization.id.in_(company_owner_matches),
            ),
        )
        .order_by(desc(Organization.created_at))
        .limit(6)
    ).all()
    users = db.scalars(
        select(User)
        .where(
            User.organization_id.in_(visible_org_ids),
            or_(
                func.lower(User.owner_name).like(search),
                func.lower(User.email).like(search),
                func.lower(User.organization_name).like(search),
                func.lower(User.role).like(search),
            ),
        )
        .order_by(desc(User.created_at))
        .limit(6)
    ).all()
    activity = db.scalars(
        select(ActivityLog)
        .where(or_(
            func.lower(ActivityLog.action).like(search),
            func.lower(ActivityLog.entity_type).like(search),
            func.lower(func.coalesce(ActivityLog.entity_id, "")).like(search),
            func.lower(cast(ActivityLog.details, String)).like(search),
        ))
        .order_by(desc(ActivityLog.timestamp))
        .limit(6)
    ).all()

    return {
        "companies": [
            {
                "id": company.id,
                "title": company.company_name,
                "subtitle": f"{company.business_email} - {company.industry}",
                "meta": company.status or "Active",
                "to": f"/super-admin/companies?company={company.id}",
            }
            for company in companies
        ],
        "users": [
            {
                "id": user.id,
                "title": user.owner_name,
                "subtitle": f"{user.email} - {user.organization_name}",
                "meta": serialize_user(user)["status"],
                "to": f"/super-admin/users?user={user.id}",
            }
            for user in users
        ],
        "activity": [
            {
                "id": row.id,
                "title": row.action,
                "subtitle": f"{row.entity_type}{(' - ' + row.entity_id) if row.entity_id else ''}",
                "meta": row.timestamp.isoformat(),
                "to": f"/super-admin/dashboard?activity={row.id}",
            }
            for row in activity
        ],
    }


def update_profile(db: Session, admin: SuperAdmin, payload: SuperAdminProfileUpdate) -> SuperAdmin:
    data = payload.model_dump(exclude_unset=True)
    if "username" in data and data["username"]:
        username = data["username"].strip().lower()
        existing = db.scalar(select(SuperAdmin).where(SuperAdmin.username == username, SuperAdmin.id != admin.id))
        if existing:
            raise HTTPException(status_code=409, detail="Username is already used by another super admin.")
        admin.username = username
    if "email" in data and data["email"]:
        email = str(data["email"]).strip().lower()
        existing = db.scalar(select(SuperAdmin).where(SuperAdmin.email == email, SuperAdmin.id != admin.id))
        if existing:
            raise HTTPException(status_code=409, detail="Email is already used by another super admin.")
        admin.email = email
    if "display_name" in data and data["display_name"]:
        admin.display_name = data["display_name"].strip()
    log_platform_activity(db, admin, "super_admin.profile_updated", "super_admin", admin.id, {"fields": sorted(data.keys())})
    db.commit()
    db.refresh(admin)
    return admin


def update_password(db: Session, admin: SuperAdmin, payload: SuperAdminPasswordUpdate) -> dict:
    if payload.new_password != payload.confirm_password:
        raise HTTPException(status_code=400, detail="New password and confirmation do not match.")
    if not verify_password(payload.current_password, admin.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect.")
    admin.password_hash = hash_password(payload.new_password)
    log_platform_activity(db, admin, "super_admin.password_updated", "super_admin", admin.id)
    db.commit()
    return {"ok": True}


def get_settings(admin: SuperAdmin) -> dict:
    return {"theme": admin.theme or "warm"}


def update_settings(db: Session, admin: SuperAdmin, payload: SuperAdminSettingsUpdate) -> dict:
    theme = payload.theme.strip()
    if theme not in SUPER_ADMIN_THEMES:
        raise HTTPException(status_code=400, detail="Unsupported super admin theme.")
    admin.theme = theme
    log_platform_activity(db, admin, "super_admin.settings_updated", "super_admin", admin.id, {"theme": theme})
    db.commit()
    db.refresh(admin)
    return get_settings(admin)


def list_admins(db: Session) -> list[SuperAdmin]:
    return list(db.scalars(select(SuperAdmin).order_by(SuperAdmin.created_at.asc())))


def create_admin(db: Session, admin: SuperAdmin, payload: SuperAdminCreate) -> SuperAdmin:
    username = payload.username.strip().lower()
    email = str(payload.email).strip().lower()
    if payload.confirm_password and payload.password != payload.confirm_password:
        raise HTTPException(status_code=400, detail="Password and confirmation do not match.")
    existing = db.scalar(select(SuperAdmin).where(or_(SuperAdmin.username == username, SuperAdmin.email == email)))
    if existing:
        raise HTTPException(status_code=409, detail="Super admin username or email already exists.")
    created = SuperAdmin(
        username=username,
        email=email,
        display_name=payload.display_name.strip(),
        password_hash=hash_password(payload.password),
        role="super_admin",
        is_active=True,
        theme="warm",
    )
    db.add(created)
    db.flush()
    log_platform_activity(db, admin, "super_admin.created", "super_admin", created.id, {"username": created.username})
    db.commit()
    db.refresh(created)
    return created


def disable_admin(db: Session, admin: SuperAdmin, target_id: str) -> SuperAdmin:
    target = db.get(SuperAdmin, target_id)
    if not target:
        raise LookupError("Super admin not found")
    if target.id == admin.id:
        raise HTTPException(status_code=400, detail="You cannot disable your own super admin account.")
    active_count = _count(db, SuperAdmin, SuperAdmin.is_active.is_(True))
    if active_count <= 1 and target.is_active:
        raise HTTPException(status_code=400, detail="At least one active super admin is required.")
    target.is_active = False
    log_platform_activity(db, admin, "super_admin.disabled", "super_admin", target.id, {"username": target.username})
    db.commit()
    db.refresh(target)
    return target
