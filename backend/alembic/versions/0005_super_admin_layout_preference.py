"""add super admin layout preference

Revision ID: 0005_super_admin_layout
Revises: 0004_super_admin_platform
Create Date: 2026-05-15
"""

from alembic import op
import sqlalchemy as sa


revision = "0005_super_admin_layout"
down_revision = "0004_super_admin_platform"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "super_admins",
        sa.Column("layout_preference", sa.String(length=80), nullable=False, server_default="Executive Compact"),
    )


def downgrade():
    op.drop_column("super_admins", "layout_preference")

