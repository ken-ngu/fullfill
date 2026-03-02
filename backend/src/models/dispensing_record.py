"""
DispensingRecord model tracking medications dispensed from hospital pharmacy.

Each record represents a single dispensing event and is used to calculate
daily replenishment quantities for 340B orders.
"""

from sqlalchemy import Column, String, Integer, DateTime, Date, Boolean, Float, ForeignKey
from sqlalchemy.orm import relationship
from src.models.medication import Base


class DispensingRecord(Base):
    """
    Tracks medications dispensed from the hospital pharmacy.

    These records are the source of truth for replenishment calculations.
    Records can be imported from pharmacy systems (Omnicell, Epic, etc.) or
    entered manually for testing.
    """
    __tablename__ = "dispensing_records"

    id = Column(String, primary_key=True)
    organization_id = Column(String, ForeignKey('organizations.id'), nullable=False, index=True)
    medication_id = Column(String, ForeignKey('medications.id'), nullable=True, index=True)

    # Product identification
    ndc_code = Column(String, nullable=False, index=True)  # National Drug Code

    # Dispensing details
    quantity_dispensed = Column(Integer, nullable=False)  # Number of units dispensed
    dispensed_at = Column(DateTime, nullable=False, index=True)  # When dispensed
    lot_number = Column(String, nullable=True)  # Manufacturing lot number
    expiration_date = Column(Date, nullable=True)  # Drug expiration date

    # 340B eligibility
    is_340b_eligible = Column(Boolean, nullable=False, default=True, index=True)
    contract_340b_id = Column(String, ForeignKey('contracts_340b.id'), nullable=True, index=True)

    # Cost tracking
    acquisition_cost = Column(Float, nullable=True)  # What the hospital paid (for 340B savings calc)

    # Patient classification
    patient_type = Column(String, nullable=True)  # "inpatient", "outpatient", "emergency"

    # Data source
    imported_from = Column(String, nullable=True)  # "omnicell", "epic", "manual", etc.

    # Relationships
    organization = relationship("Organization", foreign_keys=[organization_id])
    medication = relationship("Medication", foreign_keys=[medication_id])
    contract_340b = relationship("Contract340B", back_populates="dispensing_records")

    def __repr__(self):
        return f"<DispensingRecord {self.ndc_code} - {self.quantity_dispensed} units @ {self.dispensed_at}>"
