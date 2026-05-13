"""clear unanalyzed complaint fields

Revision ID: 0003_clear_unanalyzed
Revises: 0002_lifecycle
Create Date: 2026-05-13
"""

from alembic import op


revision = "0003_clear_unanalyzed"
down_revision = "0002_lifecycle"
branch_labels = None
depends_on = None


def upgrade():
    op.execute(
        "UPDATE complaints SET category = NULL, sentiment = NULL, priority = NULL, "
        "confidence_score = NULL, department = NULL, ai_explanation = NULL, analyzed_at = NULL "
        "WHERE status = 'Pending Analysis'"
    )
    op.execute(
        "UPDATE complaints SET category = NULL, sentiment = NULL, priority = NULL, "
        "confidence_score = NULL, department = NULL, analyzed_at = NULL "
        "WHERE status = 'Analysis Failed'"
    )


def downgrade():
    pass
