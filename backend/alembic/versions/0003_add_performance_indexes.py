"""add performance indexes for search and filtering

Revision ID: 0003
Revises: 0002
Create Date: 2026-03-01

"""
from alembic import op
import sqlalchemy as sa

revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Enable pg_trgm extension for fuzzy text search
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")

    # Composite index for most common filtering pattern
    op.create_index(
        "idx_medications_specialty_setting",
        "medications",
        ["specialty", "setting"],
    )

    # Index for sorting by formulary tier (used in top medications)
    op.create_index(
        "idx_medications_tier_name",
        "medications",
        ["formulary_tier", "name"],
    )

    # GIN trigram indexes for fuzzy text search on medication names
    op.execute(
        "CREATE INDEX idx_medications_name_gin ON medications USING gin(name gin_trgm_ops)"
    )
    op.execute(
        "CREATE INDEX idx_medications_generic_gin ON medications USING gin(generic_name gin_trgm_ops)"
    )

    # Indexes for alternatives lookups
    op.create_index(
        "idx_medications_therapeutic_class",
        "medications",
        ["therapeutic_class"],
    )
    op.create_index(
        "idx_medications_equiv_group",
        "medications",
        ["clinical_equivalence_group"],
        postgresql_where=sa.text("clinical_equivalence_group IS NOT NULL"),
    )

    # Index for category filtering
    op.create_index(
        "idx_medications_category",
        "medications",
        ["category"],
    )


def downgrade() -> None:
    op.drop_index("idx_medications_category", table_name="medications")
    op.drop_index("idx_medications_equiv_group", table_name="medications")
    op.drop_index("idx_medications_therapeutic_class", table_name="medications")
    op.execute("DROP INDEX IF EXISTS idx_medications_generic_gin")
    op.execute("DROP INDEX IF EXISTS idx_medications_name_gin")
    op.drop_index("idx_medications_tier_name", table_name="medications")
    op.drop_index("idx_medications_specialty_setting", table_name="medications")
    # Note: Not dropping pg_trgm extension as it might be used by other tables
