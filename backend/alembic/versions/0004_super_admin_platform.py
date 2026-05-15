"""add super admin platform layer

Revision ID: 0004_super_admin_platform
Revises: 0003_clear_unanalyzed
Create Date: 2026-05-15
"""

from alembic import op
import sqlalchemy as sa


revision = "0004_super_admin_platform"
down_revision = "0003_clear_unanalyzed"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("organizations", sa.Column("status", sa.String(length=40), nullable=False, server_default="Active"))
    op.add_column("organizations", sa.Column("suspended_at", sa.DateTime(), nullable=True))
    op.add_column("organizations", sa.Column("suspended_reason", sa.Text(), nullable=True))
    op.create_index("ix_organizations_status", "organizations", ["status"])

    op.create_table(
        "super_admins",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("username", sa.String(length=120), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("display_name", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("role", sa.String(length=80), nullable=False, server_default="super_admin"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("theme", sa.String(length=120), nullable=False, server_default="warm"),
        sa.Column("last_login", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_super_admins_email", "super_admins", ["email"], unique=True)
    op.create_index("ix_super_admins_username", "super_admins", ["username"], unique=True)


def downgrade():
    op.drop_index("ix_super_admins_username", table_name="super_admins")
    op.drop_index("ix_super_admins_email", table_name="super_admins")
    op.drop_table("super_admins")
    op.drop_index("ix_organizations_status", table_name="organizations")
    op.drop_column("organizations", "suspended_reason")
    op.drop_column("organizations", "suspended_at")
    op.drop_column("organizations", "status")

