from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class SignupRequest(BaseModel):
    owner_name: str = Field(min_length=2)
    company_name: str = Field(min_length=2)
    business_email: EmailStr
    password: str = Field(min_length=8)
    industry: str = "Financial Services"
    monthly_volume: str = "1,000 - 5,000 complaints / month"
    secret_key: str = Field(min_length=10)
    role: str = "Operations Admin"


class LoginRequest(BaseModel):
    username_or_email: str
    password: str
    secret_key: str
    remember: bool = True


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: str
    organization_id: str
    organization_name: str
    owner_name: str
    email: EmailStr
    username: str | None = None
    role: str
    avatar_url: str | None = None
    created_at: datetime
    updated_at: datetime
    last_login: datetime | None = None

    model_config = {"from_attributes": True}


class AuthResponse(TokenResponse):
    user: UserOut
    company: str


class RefreshRequest(BaseModel):
    refresh_token: str


class ProfileUpdate(BaseModel):
    owner_name: str | None = None
    role: str | None = None
    avatar_url: str | None = None
