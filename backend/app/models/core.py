from datetime import datetime
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Index, Integer, JSON, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
from app.utils.ids import case_id, upload_id, uuid_str


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class Organization(Base):
    __tablename__ = "organizations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    company_name: Mapped[str] = mapped_column(String(255), nullable=False)
    industry: Mapped[str] = mapped_column(String(120), nullable=False)
    monthly_volume: Mapped[str] = mapped_column(String(120), nullable=False)
    business_email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    users: Mapped[list["User"]] = relationship(back_populates="organization", cascade="all, delete-orphan")
    complaints: Mapped[list["Complaint"]] = relationship(back_populates="organization", cascade="all, delete-orphan")


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    organization_id: Mapped[str] = mapped_column(ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    organization_name: Mapped[str] = mapped_column(String(255), nullable=False)
    owner_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    username: Mapped[str | None] = mapped_column(String(120), unique=True, nullable=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    secret_key_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(80), default="Operations Admin", nullable=False)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    last_login: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    organization: Mapped["Organization"] = relationship(back_populates="users")
    settings: Mapped["UserSetting"] = relationship(back_populates="user", cascade="all, delete-orphan", uselist=False)


class Complaint(Base, TimestampMixin):
    __tablename__ = "complaints"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=case_id)
    complaint_text: Mapped[str] = mapped_column(Text, nullable=False)
    customer_name: Mapped[str] = mapped_column(String(255), nullable=False)
    customer_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    category: Mapped[str] = mapped_column(String(120), index=True, nullable=False)
    sentiment: Mapped[str] = mapped_column(String(80), index=True, nullable=False)
    priority: Mapped[str] = mapped_column(String(80), index=True, nullable=False)
    confidence_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    ai_explanation: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(80), default="Pending", index=True, nullable=False)
    department: Mapped[str] = mapped_column(String(180), index=True, nullable=False)
    source: Mapped[str] = mapped_column(String(120), default="Portal", index=True, nullable=False)
    organization_id: Mapped[str] = mapped_column(ForeignKey("organizations.id", ondelete="CASCADE"), index=True, nullable=False)
    uploaded_by: Mapped[str | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    bulk_upload_id: Mapped[str | None] = mapped_column(ForeignKey("bulk_uploads.id", ondelete="SET NULL"), nullable=True, index=True)
    assignee: Mapped[str] = mapped_column(String(255), default="Unassigned", nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    resolution_time_hours: Mapped[float | None] = mapped_column(Float, nullable=True)

    organization: Mapped["Organization"] = relationship(back_populates="complaints")
    bulk_upload: Mapped["BulkUpload"] = relationship(back_populates="complaints")


class BulkUpload(Base):
    __tablename__ = "bulk_uploads"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=upload_id)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    stored_path: Mapped[str] = mapped_column(String(500), nullable=False)
    upload_status: Mapped[str] = mapped_column(String(80), default="Queued", index=True, nullable=False)
    total_rows: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    processed_rows: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    failed_rows: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    upload_timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    uploaded_by: Mapped[str | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    organization_id: Mapped[str] = mapped_column(ForeignKey("organizations.id", ondelete="CASCADE"), index=True, nullable=False)
    analysis_summary: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    processing_logs: Mapped[list] = mapped_column(JSON, default=list, nullable=False)

    complaints: Mapped[list["Complaint"]] = relationship(back_populates="bulk_upload")


class AnalyticsSnapshot(Base):
    __tablename__ = "analytics_snapshots"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    total_complaints: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    resolved_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    urgent_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    avg_resolution_time: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    sentiment_distribution: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    category_distribution: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    generated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    organization_id: Mapped[str] = mapped_column(ForeignKey("organizations.id", ondelete="CASCADE"), index=True, nullable=False)


class UserSetting(Base):
    __tablename__ = "user_settings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    theme: Mapped[str] = mapped_column(String(120), default="Dark red system", nullable=False)
    notification_preferences: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    ai_preferences: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    language: Mapped[str] = mapped_column(String(80), default="English", nullable=False)
    dashboard_layout: Mapped[str] = mapped_column(String(120), default="Executive compact", nullable=False)
    workspace_preferences: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    integration_preferences: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)

    user: Mapped["User"] = relationship(back_populates="settings")


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    user_id: Mapped[str | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    organization_id: Mapped[str | None] = mapped_column(ForeignKey("organizations.id", ondelete="CASCADE"), nullable=True, index=True)
    action: Mapped[str] = mapped_column(String(160), nullable=False)
    entity_type: Mapped[str] = mapped_column(String(80), nullable=False)
    entity_id: Mapped[str | None] = mapped_column(String(80), nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    details: Mapped[dict] = mapped_column("metadata", JSON, default=dict, nullable=False)


class Integration(Base, TimestampMixin):
    __tablename__ = "integrations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    organization_id: Mapped[str] = mapped_column(ForeignKey("organizations.id", ondelete="CASCADE"), index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(180), nullable=False)
    type: Mapped[str] = mapped_column(String(80), nullable=False)
    status: Mapped[str] = mapped_column(String(80), default="Disconnected", nullable=False)
    health: Mapped[str] = mapped_column(String(80), default="Paused", nullable=False)
    latency: Mapped[str] = mapped_column(String(40), default="N/A", nullable=False)
    records_today: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    config: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)

    __table_args__ = (UniqueConstraint("organization_id", "name", name="uq_integration_org_name"),)


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    organization_id: Mapped[str] = mapped_column(ForeignKey("organizations.id", ondelete="CASCADE"), index=True, nullable=False)
    user_id: Mapped[str | None] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    level: Mapped[str] = mapped_column(String(40), default="info", nullable=False)
    read_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)


Index("ix_complaints_org_created", Complaint.organization_id, Complaint.created_at)
Index("ix_complaints_org_status_priority", Complaint.organization_id, Complaint.status, Complaint.priority)
