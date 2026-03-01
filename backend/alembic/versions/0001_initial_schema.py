"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-03-01

"""
from alembic import op
import sqlalchemy as sa

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "medications",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("generic_name", sa.String(), nullable=False),
        sa.Column("brand_names", sa.JSON(), nullable=False),
        sa.Column("specialty", sa.String(), nullable=False),
        sa.Column("category", sa.String(), nullable=False),
        sa.Column("subcategory", sa.String(), nullable=True),
        sa.Column("therapeutic_class", sa.String(), nullable=False),
        sa.Column("clinical_equivalence_group", sa.String(), nullable=True),
        sa.Column("dosage_form", sa.String(), nullable=False),
        sa.Column("strength", sa.String(), nullable=False),
        sa.Column("cost_low_usd", sa.Float(), nullable=False),
        sa.Column("cost_high_usd", sa.Float(), nullable=False),
        sa.Column("cost_basis", sa.String(), nullable=False),
        sa.Column("requires_pa", sa.Boolean(), nullable=False),
        sa.Column("pa_approval_rate", sa.Float(), nullable=True),
        sa.Column("pa_turnaround_days_min", sa.Integer(), nullable=True),
        sa.Column("pa_turnaround_days_max", sa.Integer(), nullable=True),
        sa.Column("brand_only", sa.Boolean(), nullable=False),
        sa.Column("formulary_tier", sa.Integer(), nullable=False),
        sa.Column("step_therapy_required", sa.Boolean(), nullable=False),
        sa.Column("step_therapy_agents", sa.JSON(), nullable=False),
        sa.Column("is_otc", sa.Boolean(), nullable=False),
        sa.Column("ndc_codes", sa.JSON(), nullable=False),
        sa.Column("rxnorm_cui", sa.String(), nullable=True),
        sa.Column("gpi_code", sa.String(), nullable=True),
        sa.Column("alternative_ids", sa.JSON(), nullable=False),
        sa.Column("data_source", sa.String(), nullable=False),
        sa.Column("last_updated", sa.Date(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "prescriber_events",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("session_id", sa.String(), nullable=False),
        sa.Column("event_type", sa.String(), nullable=False),
        sa.Column("medication_id", sa.String(), nullable=True),
        sa.Column("alternative_id", sa.String(), nullable=True),
        sa.Column("specialty", sa.String(), nullable=False),
        sa.Column("insurance_type", sa.String(), nullable=True),
        sa.Column("patient_age_group", sa.String(), nullable=True),
        sa.Column("timestamp", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_prescriber_events_session_id",
        "prescriber_events",
        ["session_id"],
    )


def downgrade() -> None:
    op.drop_index("ix_prescriber_events_session_id", table_name="prescriber_events")
    op.drop_table("prescriber_events")
    op.drop_table("medications")
