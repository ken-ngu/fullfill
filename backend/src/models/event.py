import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime
from src.models.medication import Base


class PrescriberEvent(Base):
    __tablename__ = "prescriber_events"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, nullable=False, index=True)
    event_type = Column(String, nullable=False)
    medication_id = Column(String, nullable=True)
    alternative_id = Column(String, nullable=True)
    specialty = Column(String, nullable=False, default="dermatology")
    # Patient context (no PHI — anonymous descriptors only)
    insurance_type = Column(String, nullable=True)   # commercial | medicare | medicaid | cash
    patient_age_group = Column(String, nullable=True) # child | adult | senior
    timestamp = Column(DateTime, nullable=False, default=datetime.utcnow)
