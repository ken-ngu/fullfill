"""add indexes to medication_diagnoses junction table

Revision ID: 0009
Revises: 0008
Create Date: 2026-03-02

This migration adds critical foreign key indexes to the medication_diagnoses
junction table to prevent full table scans during relationship queries.

Without these indexes, every joinedload operation on the many-to-many
relationship requires scanning the entire junction table, which becomes
exponentially slower as data grows.

Performance impact: Expected 10-20x improvement in diagnosis detail queries
"""
from alembic import op

revision = "0009"
down_revision = "0008"
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add indexes on foreign key columns in medication_diagnoses junction table"""

    # Index for queries looking up diagnoses by medication
    # Used by: Medication.diagnoses relationship queries
    op.create_index(
        'idx_medication_diagnoses_medication_id',
        'medication_diagnoses',
        ['medication_id'],
        unique=False
    )

    # Index for queries looking up medications by diagnosis
    # Used by: Diagnosis.medications relationship queries
    op.create_index(
        'idx_medication_diagnoses_diagnosis_id',
        'medication_diagnoses',
        ['diagnosis_id'],
        unique=False
    )


def downgrade() -> None:
    """Remove the junction table indexes"""
    op.drop_index('idx_medication_diagnoses_diagnosis_id', table_name='medication_diagnoses')
    op.drop_index('idx_medication_diagnoses_medication_id', table_name='medication_diagnoses')
