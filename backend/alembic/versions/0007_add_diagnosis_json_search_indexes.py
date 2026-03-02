"""add GIN trigram indexes for diagnosis JSON columns

Revision ID: 0007
Revises: 0006
Create Date: 2026-03-01

"""
from alembic import op

revision = "0007"
down_revision = "0006"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add GIN trigram indexes for JSON column searches
    # These support the ILIKE queries on casted JSON columns in diagnosis search

    # Index for synonyms array search (e.g., "UTI", "bladder infection")
    op.execute(
        """
        CREATE INDEX idx_diagnoses_synonyms_gin
        ON diagnoses
        USING gin((synonyms::text) gin_trgm_ops)
        """
    )

    # Index for ICD-10 codes array search (e.g., "N39.0")
    op.execute(
        """
        CREATE INDEX idx_diagnoses_icd10_codes_gin
        ON diagnoses
        USING gin((icd10_codes::text) gin_trgm_ops)
        """
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS idx_diagnoses_icd10_codes_gin")
    op.execute("DROP INDEX IF EXISTS idx_diagnoses_synonyms_gin")
