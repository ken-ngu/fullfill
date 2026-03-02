"""add diagnoses and goodrx pricing

Revision ID: 0005
Revises: 0004
Create Date: 2026-03-01

"""
from alembic import op
import sqlalchemy as sa

revision = "0005"
down_revision = "0004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create diagnoses table
    op.create_table(
        "diagnoses",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("icd10_codes", sa.JSON(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("synonyms", sa.JSON(), nullable=False),
        sa.Column("category", sa.String(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )

    # Create index on diagnosis name for faster search
    op.create_index(
        "ix_diagnoses_name",
        "diagnoses",
        ["name"],
    )

    # Create medication-diagnosis association table (many-to-many)
    op.create_table(
        "medication_diagnoses",
        sa.Column("medication_id", sa.String(), nullable=False),
        sa.Column("diagnosis_id", sa.String(), nullable=False),
        sa.ForeignKeyConstraint(["medication_id"], ["medications.id"]),
        sa.ForeignKeyConstraint(["diagnosis_id"], ["diagnoses.id"]),
        sa.PrimaryKeyConstraint("medication_id", "diagnosis_id"),
    )

    # Create GoodRx prices table
    op.create_table(
        "goodrx_prices",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("medication_id", sa.String(), nullable=False),
        sa.Column("cash_price_low_usd", sa.Float(), nullable=False),
        sa.Column("cash_price_high_usd", sa.Float(), nullable=False),
        sa.Column("coupon_price_usd", sa.Float(), nullable=True),
        sa.Column("zip_code", sa.String(), nullable=True),
        sa.Column("pharmacy_type", sa.String(), nullable=True),
        sa.Column("source_url", sa.String(), nullable=True),
        sa.Column("fetched_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["medication_id"], ["medications.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    # Create indexes for GoodRx prices
    op.create_index(
        "ix_goodrx_medication_id",
        "goodrx_prices",
        ["medication_id"],
    )

    op.create_index(
        "ix_goodrx_expires_at",
        "goodrx_prices",
        ["expires_at"],
    )


def downgrade() -> None:
    # Drop indexes first
    op.drop_index("ix_goodrx_expires_at", table_name="goodrx_prices")
    op.drop_index("ix_goodrx_medication_id", table_name="goodrx_prices")
    op.drop_index("ix_diagnoses_name", table_name="diagnoses")

    # Drop tables
    op.drop_table("goodrx_prices")
    op.drop_table("medication_diagnoses")
    op.drop_table("diagnoses")
