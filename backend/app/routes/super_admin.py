from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_super_admin
from app.models import SuperAdmin
from app.schemas.super_admin import (
    CompanyStatusUpdate,
    PlatformCompanyOut,
    PlatformUserOut,
    SuperAdminAuthResponse,
    SuperAdminCreate,
    SuperAdminLoginRequest,
    SuperAdminOut,
    SuperAdminPasswordUpdate,
    SuperAdminProfileUpdate,
    SuperAdminSettingsOut,
    SuperAdminSettingsUpdate,
)
from app.services import super_admin as service


router = APIRouter(prefix="/super-admin", tags=["Super Admin"])


@router.post("/login", response_model=SuperAdminAuthResponse)
def login(payload: SuperAdminLoginRequest, db: Session = Depends(get_db)):
    return service.authenticate_super_admin(db, payload)


@router.get("/me", response_model=SuperAdminOut)
def me(admin: SuperAdmin = Depends(get_current_super_admin)):
    return admin


@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db), _: SuperAdmin = Depends(get_current_super_admin)):
    return service.dashboard(db)


@router.get("/search")
def search(
    q: str = Query(..., min_length=2),
    db: Session = Depends(get_db),
    _: SuperAdmin = Depends(get_current_super_admin),
):
    return service.global_search(db, q)


@router.get("/companies", response_model=list[PlatformCompanyOut])
def companies(
    q: str | None = None,
    status_value: str | None = Query(None, alias="status"),
    db: Session = Depends(get_db),
    _: SuperAdmin = Depends(get_current_super_admin),
):
    return service.list_companies(db, q=q, status_value=status_value)


@router.get("/companies/{organization_id}")
def company_detail(
    organization_id: str,
    db: Session = Depends(get_db),
    _: SuperAdmin = Depends(get_current_super_admin),
):
    try:
        return service.get_company_detail(db, organization_id)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.patch("/companies/{organization_id}/suspend", response_model=PlatformCompanyOut)
def suspend_company(
    organization_id: str,
    payload: CompanyStatusUpdate,
    db: Session = Depends(get_db),
    admin: SuperAdmin = Depends(get_current_super_admin),
):
    try:
        return service.suspend_company(db, admin, organization_id, payload)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.patch("/companies/{organization_id}/reactivate", response_model=PlatformCompanyOut)
def reactivate_company(
    organization_id: str,
    db: Session = Depends(get_db),
    admin: SuperAdmin = Depends(get_current_super_admin),
):
    try:
        return service.reactivate_company(db, admin, organization_id)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.delete("/companies/{organization_id}")
def delete_company(
    organization_id: str,
    confirmation: str = Query(...),
    db: Session = Depends(get_db),
    admin: SuperAdmin = Depends(get_current_super_admin),
):
    try:
        return service.delete_company(db, admin, organization_id, confirmation)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/users", response_model=list[PlatformUserOut])
def users(
    q: str | None = None,
    status_value: str | None = Query(None, alias="status"),
    db: Session = Depends(get_db),
    _: SuperAdmin = Depends(get_current_super_admin),
):
    return service.list_users(db, q=q, status_value=status_value)


@router.patch("/users/{user_id}/activate", response_model=PlatformUserOut)
def activate_user(user_id: str, db: Session = Depends(get_db), admin: SuperAdmin = Depends(get_current_super_admin)):
    try:
        return service.set_user_active(db, admin, user_id, True)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.patch("/users/{user_id}/deactivate", response_model=PlatformUserOut)
def deactivate_user(user_id: str, db: Session = Depends(get_db), admin: SuperAdmin = Depends(get_current_super_admin)):
    try:
        return service.set_user_active(db, admin, user_id, False)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.patch("/settings/profile", response_model=SuperAdminOut)
def update_profile(
    payload: SuperAdminProfileUpdate,
    db: Session = Depends(get_db),
    admin: SuperAdmin = Depends(get_current_super_admin),
):
    return service.update_profile(db, admin, payload)


@router.patch("/settings/password")
def update_password(
    payload: SuperAdminPasswordUpdate,
    db: Session = Depends(get_db),
    admin: SuperAdmin = Depends(get_current_super_admin),
):
    return service.update_password(db, admin, payload)


@router.get("/settings", response_model=SuperAdminSettingsOut)
def get_settings(admin: SuperAdmin = Depends(get_current_super_admin)):
    return service.get_settings(admin)


@router.patch("/settings", response_model=SuperAdminSettingsOut)
def update_settings(
    payload: SuperAdminSettingsUpdate,
    db: Session = Depends(get_db),
    admin: SuperAdmin = Depends(get_current_super_admin),
):
    return service.update_settings(db, admin, payload)


@router.get("/admins", response_model=list[SuperAdminOut])
def admins(db: Session = Depends(get_db), _: SuperAdmin = Depends(get_current_super_admin)):
    return service.list_admins(db)


@router.post("/admins", response_model=SuperAdminOut)
def create_admin(
    payload: SuperAdminCreate,
    db: Session = Depends(get_db),
    admin: SuperAdmin = Depends(get_current_super_admin),
):
    return service.create_admin(db, admin, payload)


@router.patch("/admins/{admin_id}/disable", response_model=SuperAdminOut)
def disable_admin(
    admin_id: str,
    db: Session = Depends(get_db),
    admin: SuperAdmin = Depends(get_current_super_admin),
):
    try:
        return service.disable_admin(db, admin, admin_id)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
