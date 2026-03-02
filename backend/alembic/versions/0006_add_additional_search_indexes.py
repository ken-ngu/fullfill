"""add additional search indexes for OTC medications and diagnoses

Revision ID: 0006
Revises: add2781bc610
Create Date: 2026-03-01

"""
from alembic import op
import sqlalchemy as sa

revision = "0006"
down_revision = "add2781bc610"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add GIN index on diagnoses.synonyms for fast array search
    # This improves performance when searching by synonym terms
    # Note: JSON type columns don't support GIN indexes directly
    # Skipping this index for now - can add after converting column to JSONB
    # op.execute(
    #     """
    #     CREATE INDEX idx_diagnoses_synonyms_gin
    #     ON diagnoses
    #     USING gin(synonyms)
    #     """
    # )

    # Add GIN trigram index on diagnosis name for fuzzy search
    op.execute(
        """
        CREATE INDEX idx_diagnoses_name_gin
        ON diagnoses
        USING gin(name gin_trgm_ops)
        """
    )

    # Add index on medication is_otc for filtering OTC drugs
    op.create_index(
        "idx_medications_is_otc",
        "medications",
        ["is_otc"],
    )

    # Add composite index for common OTC search pattern
    op.create_index(
        "idx_medications_otc_tier",
        "medications",
        ["is_otc", "formulary_tier"],
    )

    # Add indexes on dispensing_records for 340B queries
    op.create_index(
        "idx_dispensing_records_org_date",
        "dispensing_records",
        ["organization_id", "dispensed_at"],
    )

    op.create_index(
        "idx_dispensing_records_340b_eligible",
        "dispensing_records",
        ["is_340b_eligible"],
        postgresql_where=sa.text("is_340b_eligible = true"),
    )

    # Add index on replenishment_orders.status for dashboard queries
    op.create_index(
        "idx_replenishment_orders_status",
        "replenishment_orders",
        ["status"],
    )

    # Add composite index for common order queries
    op.create_index(
        "idx_replenishment_orders_org_status",
        "replenishment_orders",
        ["organization_id", "status"],
    )


def downgrade() -> None:
    op.drop_index("idx_replenishment_orders_org_status", table_name="replenishment_orders")
    op.drop_index("idx_replenishment_orders_status", table_name="replenishment_orders")
    op.drop_index("idx_dispensing_records_340b_eligible", table_name="dispensing_records")
    op.drop_index("idx_dispensing_records_org_date", table_name="dispensing_records")
    op.drop_index("idx_medications_otc_tier", table_name="medications")
    op.drop_index("idx_medications_is_otc", table_name="medications")
    op.execute("DROP INDEX IF EXISTS idx_diagnoses_name_gin")
    op.execute("DROP INDEX IF EXISTS idx_diagnoses_synonyms_gin")
