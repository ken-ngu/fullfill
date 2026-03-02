"""
User model with multi-tenant support and role-based access control.
"""
from __future__ import annotations

from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from src.models.medication import Base


class User(Base):
    """
    Represents a user of the FullFill platform.

    Users can be:
    - Clinicians (search medications, view pricing)
    - Hospital admins (manage 340B orders)
    - Pharmacy staff (view and modify 340B orders)
    """
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)

    # Profile
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)

    # Multi-tenant and role support
    organization_id = Column(String, ForeignKey('organizations.id'), nullable=True, index=True)
    role = Column(String, nullable=False, default="clinician", index=True)
    # Roles: "clinician", "hospital_admin", "pharmacy_staff", "system_admin"

    # Timestamps
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
    last_login_at = Column(DateTime, nullable=True)

    # Relationships (will be fully connected in later phases)
    # organization = relationship("Organization", back_populates="users")

    def __repr__(self):
        return f"<User {self.email} ({self.role})>"
