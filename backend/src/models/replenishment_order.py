"""
ReplenishmentOrder model representing daily 340B replenishment orders.

Each order represents a daily replenishment request from a hospital pharmacy,
containing line items calculated from dispensing records. Orders go through
a review workflow before being submitted to vendors.
"""
from __future__ import annotations

from sqlalchemy import Column, String, Date, DateTime, JSON, Integer, Float, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from src.models.medication import Base
import enum


class OrderStatus(enum.Enum):
    """Status values for replenishment orders."""
    DRAFT = "DRAFT"
    PENDING_REVIEW = "PENDING_REVIEW"
    APPROVED = "APPROVED"
    SUBMITTED = "SUBMITTED"
    CANCELLED = "CANCELLED"


class ReplenishmentOrder(Base):
    """
    Represents a daily replenishment order for 340B medications.

    Orders are generated from dispensing records and reviewed by pharmacy staff
    before being submitted to vendors (Cardinal Health, McKesson, etc.).
    """
    __tablename__ = "replenishment_orders"

    id = Column(String, primary_key=True)
    organization_id = Column(String, ForeignKey('organizations.id'), nullable=False, index=True)

    # Order identification
    order_date = Column(Date, nullable=False, index=True)  # Date this order is for
    status = Column(
        SQLEnum(OrderStatus, native_enum=False, length=20),
        nullable=False,
        default=OrderStatus.DRAFT,
        index=True
    )

    # Order details
    cutoff_time = Column(DateTime, nullable=True)  # When vendor cutoff occurred
    line_items = Column(JSON, nullable=False, default=list)  # List of {ndc, quantity, unit_cost, etc.}
    total_items = Column(Integer, nullable=False, default=0)  # Total line items
    estimated_cost_usd = Column(Float, nullable=True)  # Total estimated cost
    estimated_340b_savings_usd = Column(Float, nullable=True)  # Estimated savings vs WAC

    # Workflow tracking
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    created_by = Column(String, nullable=True)  # User ID who created/generated the order

    reviewed_at = Column(DateTime, nullable=True)
    reviewed_by = Column(String, nullable=True)  # User ID who reviewed/approved

    submitted_at = Column(DateTime, nullable=True)  # When submitted to vendor

    # Admin notes and history
    admin_notes = Column(String, nullable=True)  # Notes from reviewers
    modification_history = Column(JSON, nullable=False, default=list)  # Track changes made during review

    # Relationships
    organization = relationship("Organization", foreign_keys=[organization_id])

    def __repr__(self):
        return f"<ReplenishmentOrder {self.order_date} - {self.status.value} - {self.total_items} items>"
