from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class SuperAdminLoginRequest(BaseModel):
    username_or_email: str
    password: str
    remember: bool = True


class SuperAdminOut(BaseModel):
    id: str
    username: str
    email: EmailStr
    display_name: str
    role: str
    is_active: bool
    layout_preference: str = "Executive Compact"
    created_at: datetime
    updated_at: datetime
    last_login: datetime | None = None

    model_config = {"from_attributes": True}


class SuperAdminAuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    admin: SuperAdminOut


class PlatformCompanyOut(BaseModel):
    id: str
    company_name: str
    business_email: EmailStr
    industry: str
    monthly_volume: str
    owner_name: str | None = None
    users_count: int
    complaints_count: int
    analyses_count: int
    uploads_count: int
    status: str
    created_at: datetime
    suspended_at: datetime | None = None
    suspended_reason: str | None = None


class PlatformUserOut(BaseModel):
    id: str
    owner_name: str
    email: EmailStr
    username: str | None = None
    company: str
    organization_id: str
    role: str
    status: str
    is_active: bool
    created_at: datetime
    last_login: datetime | None = None


class CompanyStatusUpdate(BaseModel):
    reason: str | None = None


class SuperAdminProfileUpdate(BaseModel):
    username: str | None = Field(default=None, min_length=3)
    email: EmailStr | None = None
    display_name: str | None = Field(default=None, min_length=2)


class SuperAdminPasswordUpdate(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8)
    confirm_password: str = Field(min_length=8)


class SuperAdminCreate(BaseModel):
    display_name: str = Field(min_length=2)
    email: EmailStr
    username: str = Field(min_length=3)
    temporary_password: str = Field(min_length=8)


class SuperAdminSettingsOut(BaseModel):
    layout_preference: str


class SuperAdminSettingsUpdate(BaseModel):
    layout_preference: str = Field(min_length=2)
