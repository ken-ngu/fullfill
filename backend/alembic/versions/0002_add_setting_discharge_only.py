"""add setting and discharge_only to medications

Revision ID: 0002
Revises: 0001
Create Date: 2026-03-01

"""
from alembic import op
import sqlalchemy as sa

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "medications",
        sa.Column("setting", sa.String(), nullable=False, server_default="outpatient"),
    )
    op.add_column(
        "medications",
        sa.Column("discharge_only", sa.Boolean(), nullable=False, server_default=sa.false()),
    )


def downgrade() -> None:
    op.drop_column("medications", "discharge_only")
    op.drop_column("medications", "setting")
