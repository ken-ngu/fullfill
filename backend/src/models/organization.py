"""
Organization/Hospital model for multi-tenant 340B support.

Each organization represents a hospital, clinic, or pharmacy that uses the 340B program.
"""
from __future__ import annotations

from sqlalchemy import Column, String, JSON, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from src.models.medication import Base


class Organization(Base):
    """
    Represents a healthcare organization (hospital, clinic, pharmacy).

    Multi-tenant isolation: Each organization has its own isolated data.
    """
    __tablename__ = "organizations"

    id = Column(String, primary_key=True)  # e.g., "childrens-hospital-seattle"
    name = Column(String, nullable=False)  # "Seattle Children's Hospital"
    type = Column(String, nullable=False)  # "hospital", "clinic", "pharmacy"
    is_340b_eligible = Column(Boolean, default=False, nullable=False)

    # 340B Program details
    program_id = Column(String, nullable=True)  # 340B covered entity ID
    contract_pharmacy_ids = Column(JSON, default=list, nullable=False)  # Contract pharmacy locations

    # Contact & settings
    primary_contact_email = Column(String, nullable=True)
    settings = Column(JSON, default=dict, nullable=False)  # Cutoff times, vendor preferences, etc.

    # Timestamps
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships (will be added in later phases)
    # users = relationship("User", back_populates="organization")
    # contracts_340b = relationship("Contract340B", back_populates="organization")
    # replenishment_orders = relationship("ReplenishmentOrder", back_populates="organization")

    def __repr__(self):
        return f"<Organization {self.id}: {self.name}>"
