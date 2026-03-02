"""convert JSON columns to JSONB for better indexing and performance

Revision ID: 0008
Revises: 0007
Create Date: 2026-03-01

This migration addresses search performance issues by:
1. Converting JSON columns to JSONB (binary format with full index support)
2. Replacing inefficient expression indexes with proper JSONB GIN indexes
3. Enabling fast array element searches without full table scans

Performance impact: Expected 10-100x improvement in search query times
"""
from alembic import op

revision = "0008"
down_revision = "0007"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Step 1: Drop old expression indexes from migration 0007
    # These indexes on casted JSON columns are not efficiently used by PostgreSQL
    op.execute("DROP INDEX IF EXISTS idx_diagnoses_synonyms_gin")
    op.execute("DROP INDEX IF EXISTS idx_diagnoses_icd10_codes_gin")

    # Step 2: Convert JSON columns to JSONB
    # JSONB is PostgreSQL's binary JSON format with full index support
    # The conversion is lossless and preserves all data

    # Convert diagnosis columns
    op.execute(
        """
        ALTER TABLE diagnoses
            ALTER COLUMN synonyms TYPE jsonb USING synonyms::jsonb,
            ALTER COLUMN icd10_codes TYPE jsonb USING icd10_codes::jsonb
        """
    )

    # Convert medication columns
    op.execute(
        """
        ALTER TABLE medications
            ALTER COLUMN brand_names TYPE jsonb USING brand_names::jsonb,
            ALTER COLUMN step_therapy_agents TYPE jsonb USING step_therapy_agents::jsonb,
            ALTER COLUMN ndc_codes TYPE jsonb USING ndc_codes::jsonb,
            ALTER COLUMN alternative_ids TYPE jsonb USING alternative_ids::jsonb
        """
    )

    # Step 3: Add proper GIN indexes on JSONB columns
    # These indexes support fast array containment and element searches

    # Diagnosis indexes
    op.execute(
        """
        CREATE INDEX idx_diagnoses_synonyms_jsonb_gin
        ON diagnoses
        USING gin(synonyms)
        """
    )

    op.execute(
        """
        CREATE INDEX idx_diagnoses_icd10_jsonb_gin
        ON diagnoses
        USING gin(icd10_codes)
        """
    )

    # Medication indexes
    op.execute(
        """
        CREATE INDEX idx_medications_brand_names_jsonb_gin
        ON medications
        USING gin(brand_names)
        """
    )


def downgrade() -> None:
    # Drop JSONB indexes
    op.execute("DROP INDEX IF EXISTS idx_medications_brand_names_jsonb_gin")
    op.execute("DROP INDEX IF EXISTS idx_diagnoses_icd10_jsonb_gin")
    op.execute("DROP INDEX IF EXISTS idx_diagnoses_synonyms_jsonb_gin")

    # Convert JSONB columns back to JSON
    op.execute(
        """
        ALTER TABLE medications
            ALTER COLUMN alternative_ids TYPE json USING alternative_ids::json,
            ALTER COLUMN ndc_codes TYPE json USING ndc_codes::json,
            ALTER COLUMN step_therapy_agents TYPE json USING step_therapy_agents::json,
            ALTER COLUMN brand_names TYPE json USING brand_names::json
        """
    )

    op.execute(
        """
        ALTER TABLE diagnoses
            ALTER COLUMN icd10_codes TYPE json USING icd10_codes::json,
            ALTER COLUMN synonyms TYPE json USING synonyms::json
        """
    )

    # Restore old expression indexes
    op.execute(
        """
        CREATE INDEX idx_diagnoses_icd10_codes_gin
        ON diagnoses
        USING gin((icd10_codes::text) gin_trgm_ops)
        """
    )

    op.execute(
        """
        CREATE INDEX idx_diagnoses_synonyms_gin
        ON diagnoses
        USING gin((synonyms::text) gin_trgm_ops)
        """
    )
