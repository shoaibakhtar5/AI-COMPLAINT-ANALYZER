"""complaint analysis lifecycle

Revision ID: 0002_lifecycle
Revises: 0001_initial_schema
Create Date: 2026-05-13
"""

from alembic import op
import sqlalchemy as sa


revision = "0002_lifecycle"
down_revision = "0001_initial_schema"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("complaints") as batch_op:
        batch_op.alter_column("category", existing_type=sa.String(length=120), nullable=True)
        batch_op.alter_column("sentiment", existing_type=sa.String(length=80), nullable=True)
        batch_op.alter_column("priority", existing_type=sa.String(length=80), nullable=True)
        batch_op.alter_column("confidence_score", existing_type=sa.Float(), nullable=True)
        batch_op.alter_column("department", existing_type=sa.String(length=180), nullable=True)
        batch_op.add_column(sa.Column("analyzed_at", sa.DateTime(), nullable=True))
    op.execute("UPDATE complaints SET status = 'Pending Analysis' WHERE status IN ('Pending', 'In Progress', 'Escalated')")
    op.execute("UPDATE complaints SET status = 'Solved' WHERE status IN ('Resolved')")
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
    op.execute(
        "UPDATE complaints SET analyzed_at = updated_at "
        "WHERE status = 'Solved' AND analyzed_at IS NULL "
        "AND category IS NOT NULL AND sentiment IS NOT NULL AND priority IS NOT NULL"
    )


def downgrade():
    op.execute("UPDATE complaints SET category = COALESCE(category, 'Not Analyzed')")
    op.execute("UPDATE complaints SET sentiment = COALESCE(sentiment, 'Not Analyzed')")
    op.execute("UPDATE complaints SET priority = COALESCE(priority, 'Not Analyzed')")
    op.execute("UPDATE complaints SET confidence_score = COALESCE(confidence_score, 0)")
    op.execute("UPDATE complaints SET department = COALESCE(department, 'Unassigned')")
    with op.batch_alter_table("complaints") as batch_op:
        batch_op.drop_column("analyzed_at")
        batch_op.alter_column("department", existing_type=sa.String(length=180), nullable=False)
        batch_op.alter_column("confidence_score", existing_type=sa.Float(), nullable=False)
        batch_op.alter_column("priority", existing_type=sa.String(length=80), nullable=False)
        batch_op.alter_column("sentiment", existing_type=sa.String(length=80), nullable=False)
        batch_op.alter_column("category", existing_type=sa.String(length=120), nullable=False)
