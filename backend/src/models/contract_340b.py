"""
Contract340B model representing 340B pricing contracts with pharmaceutical vendors.

Each contract links a hospital organization to a vendor (e.g., Cardinal Health, McKesson)
and defines the medications covered under 340B pricing.
"""

from sqlalchemy import Column, String, Date, Boolean, JSON, Float, ForeignKey
from sqlalchemy.orm import relationship
from src.models.medication import Base


class Contract340B(Base):
    """
    Represents a 340B contract between a healthcare organization and a pharmaceutical vendor.

    340B contracts enable eligible healthcare organizations to purchase outpatient drugs
    at significantly reduced prices from participating pharmaceutical manufacturers.
    """
    __tablename__ = "contracts_340b"

    id = Column(String, primary_key=True)
    organization_id = Column(String, ForeignKey('organizations.id'), nullable=False, index=True)

    # Contract details
    contract_number = Column(String, nullable=False)
    vendor_name = Column(String, nullable=False)  # "Cardinal Health", "McKesson", etc.
    vendor_portal_url = Column(String, nullable=True)  # URL to vendor's ordering portal

    # Contract period
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)  # NULL means ongoing
    is_active = Column(Boolean, nullable=False, default=True, index=True)

    # Covered medications and pricing
    covered_medication_ndcs = Column(JSON, nullable=False, default=list)  # List of NDC codes
    discount_percentage = Column(Float, nullable=True)  # Average discount (e.g., 0.25 for 25%)

    # Relationships
    organization = relationship("Organization", foreign_keys=[organization_id])
    dispensing_records = relationship("DispensingRecord", back_populates="contract_340b")

    def __repr__(self):
        return f"<Contract340B {self.contract_number} - {self.vendor_name}>"
