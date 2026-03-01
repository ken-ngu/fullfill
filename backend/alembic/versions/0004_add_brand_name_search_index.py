"""add brand name search index

Revision ID: 0004
Revises: 0003
Create Date: 2026-03-01
"""
from alembic import op
import sqlalchemy as sa

revision = "0004"
down_revision = "0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add expression index for text search on brand_names (JSON type)
    # This improves performance for case-insensitive searches
    op.execute(
        """
        CREATE INDEX idx_medications_brand_names_text
        ON medications
        USING gin(lower(brand_names::text) gin_trgm_ops)
        """
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS idx_medications_brand_names_text")
