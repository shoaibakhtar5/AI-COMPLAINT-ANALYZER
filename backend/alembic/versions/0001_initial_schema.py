"""initial schema

Revision ID: 0001_initial_schema
Revises:
Create Date: 2026-05-10
"""

from alembic import op
import sqlalchemy as sa

revision = "0001_initial_schema"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "organizations",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("company_name", sa.String(255), nullable=False),
        sa.Column("industry", sa.String(120), nullable=False),
        sa.Column("monthly_volume", sa.String(120), nullable=False),
        sa.Column("business_email", sa.String(255), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.UniqueConstraint("business_email"),
    )
    op.create_index("ix_organizations_business_email", "organizations", ["business_email"])

    op.create_table(
        "users",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("organization_id", sa.String(36), sa.ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False),
        sa.Column("organization_name", sa.String(255), nullable=False),
        sa.Column("owner_name", sa.String(255), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("username", sa.String(120), nullable=True),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("secret_key_hash", sa.String(255), nullable=False),
        sa.Column("role", sa.String(80), nullable=False),
        sa.Column("avatar_url", sa.String(500), nullable=True),
        sa.Column("last_login", sa.DateTime(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.UniqueConstraint("email"),
        sa.UniqueConstraint("username"),
    )
    op.create_index("ix_users_email", "users", ["email"])
    op.create_index("ix_users_organization_id", "users", ["organization_id"])

    op.create_table(
        "bulk_uploads",
        sa.Column("id", sa.String(32), primary_key=True),
        sa.Column("file_name", sa.String(255), nullable=False),
        sa.Column("stored_path", sa.String(500), nullable=False),
        sa.Column("upload_status", sa.String(80), nullable=False),
        sa.Column("total_rows", sa.Integer(), nullable=False),
        sa.Column("processed_rows", sa.Integer(), nullable=False),
        sa.Column("failed_rows", sa.Integer(), nullable=False),
        sa.Column("upload_timestamp", sa.DateTime(), nullable=False),
        sa.Column("uploaded_by", sa.String(36), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("organization_id", sa.String(36), sa.ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False),
        sa.Column("analysis_summary", sa.JSON(), nullable=False),
        sa.Column("processing_logs", sa.JSON(), nullable=False),
    )
    op.create_index("ix_bulk_uploads_organization_id", "bulk_uploads", ["organization_id"])
    op.create_index("ix_bulk_uploads_uploaded_by", "bulk_uploads", ["uploaded_by"])
    op.create_index("ix_bulk_uploads_upload_status", "bulk_uploads", ["upload_status"])

    op.create_table(
        "complaints",
        sa.Column("id", sa.String(32), primary_key=True),
        sa.Column("complaint_text", sa.Text(), nullable=False),
        sa.Column("customer_name", sa.String(255), nullable=False),
        sa.Column("customer_email", sa.String(255), nullable=True),
        sa.Column("category", sa.String(120), nullable=True),
        sa.Column("sentiment", sa.String(80), nullable=True),
        sa.Column("priority", sa.String(80), nullable=True),
        sa.Column("confidence_score", sa.Float(), nullable=True),
        sa.Column("ai_explanation", sa.Text(), nullable=True),
        sa.Column("status", sa.String(80), nullable=False),
        sa.Column("department", sa.String(180), nullable=True),
        sa.Column("analyzed_at", sa.DateTime(), nullable=True),
        sa.Column("source", sa.String(120), nullable=False),
        sa.Column("organization_id", sa.String(36), sa.ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False),
        sa.Column("uploaded_by", sa.String(36), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("bulk_upload_id", sa.String(32), sa.ForeignKey("bulk_uploads.id", ondelete="SET NULL"), nullable=True),
        sa.Column("assignee", sa.String(255), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("resolution_time_hours", sa.Float(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )
    for column in ["category", "sentiment", "priority", "status", "department", "source", "organization_id", "uploaded_by", "bulk_upload_id"]:
        op.create_index(f"ix_complaints_{column}", "complaints", [column])
    op.create_index("ix_complaints_org_created", "complaints", ["organization_id", "created_at"])
    op.create_index("ix_complaints_org_status_priority", "complaints", ["organization_id", "status", "priority"])

    op.create_table(
        "analytics_snapshots",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("total_complaints", sa.Integer(), nullable=False),
        sa.Column("resolved_count", sa.Integer(), nullable=False),
        sa.Column("urgent_count", sa.Integer(), nullable=False),
        sa.Column("avg_resolution_time", sa.Float(), nullable=False),
        sa.Column("sentiment_distribution", sa.JSON(), nullable=False),
        sa.Column("category_distribution", sa.JSON(), nullable=False),
        sa.Column("generated_at", sa.DateTime(), nullable=False),
        sa.Column("organization_id", sa.String(36), sa.ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False),
    )
    op.create_index("ix_analytics_snapshots_organization_id", "analytics_snapshots", ["organization_id"])

    op.create_table(
        "user_settings",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("theme", sa.String(120), nullable=False),
        sa.Column("notification_preferences", sa.JSON(), nullable=False),
        sa.Column("ai_preferences", sa.JSON(), nullable=False),
        sa.Column("language", sa.String(80), nullable=False),
        sa.Column("dashboard_layout", sa.String(120), nullable=False),
        sa.Column("workspace_preferences", sa.JSON(), nullable=False),
        sa.Column("integration_preferences", sa.JSON(), nullable=False),
        sa.UniqueConstraint("user_id"),
    )

    op.create_table(
        "activity_logs",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("organization_id", sa.String(36), sa.ForeignKey("organizations.id", ondelete="CASCADE"), nullable=True),
        sa.Column("action", sa.String(160), nullable=False),
        sa.Column("entity_type", sa.String(80), nullable=False),
        sa.Column("entity_id", sa.String(80), nullable=True),
        sa.Column("timestamp", sa.DateTime(), nullable=False),
        sa.Column("metadata", sa.JSON(), nullable=False),
    )
    op.create_index("ix_activity_logs_user_id", "activity_logs", ["user_id"])
    op.create_index("ix_activity_logs_organization_id", "activity_logs", ["organization_id"])

    op.create_table(
        "integrations",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("organization_id", sa.String(36), sa.ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(180), nullable=False),
        sa.Column("type", sa.String(80), nullable=False),
        sa.Column("status", sa.String(80), nullable=False),
        sa.Column("health", sa.String(80), nullable=False),
        sa.Column("latency", sa.String(40), nullable=False),
        sa.Column("records_today", sa.Integer(), nullable=False),
        sa.Column("config", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.UniqueConstraint("organization_id", "name", name="uq_integration_org_name"),
    )
    op.create_index("ix_integrations_organization_id", "integrations", ["organization_id"])

    op.create_table(
        "notifications",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("organization_id", sa.String(36), sa.ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("level", sa.String(40), nullable=False),
        sa.Column("read_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_notifications_organization_id", "notifications", ["organization_id"])
    op.create_index("ix_notifications_user_id", "notifications", ["user_id"])


def downgrade():
    op.drop_table("notifications")
    op.drop_table("integrations")
    op.drop_table("activity_logs")
    op.drop_table("user_settings")
    op.drop_table("analytics_snapshots")
    op.drop_table("complaints")
    op.drop_table("bulk_uploads")
    op.drop_table("users")
    op.drop_table("organizations")
