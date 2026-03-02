from sqlalchemy import Column, String, Float, Boolean, Integer, Date, JSON
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase, relationship


class Base(DeclarativeBase):
    pass


class Medication(Base):
    __tablename__ = "medications"

    # Identity
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    generic_name = Column(String, nullable=False)
    brand_names = Column(JSONB, nullable=False, default=list)

    # Multi-specialty classification
    specialty = Column(String, nullable=False, default="dermatology")
    category = Column(String, nullable=False)
    subcategory = Column(String, nullable=True)
    therapeutic_class = Column(String, nullable=False)
    clinical_equivalence_group = Column(String, nullable=True)

    # Care setting: outpatient | urgent_care | emergency | inpatient
    setting = Column(String, nullable=False, server_default="outpatient")
    # True for drugs dispensed only at discharge (ER/UC), not during the encounter
    discharge_only = Column(Boolean, nullable=False, server_default="false")

    # Formulation
    dosage_form = Column(String, nullable=False)
    strength = Column(String, nullable=False)

    # Cost
    cost_low_usd = Column(Float, nullable=False)
    cost_high_usd = Column(Float, nullable=False)
    cost_basis = Column(String, nullable=False, default="per_30_day")

    # Insurance friction
    requires_pa = Column(Boolean, nullable=False, default=False)
    pa_approval_rate = Column(Float, nullable=True)
    pa_turnaround_days_min = Column(Integer, nullable=True)
    pa_turnaround_days_max = Column(Integer, nullable=True)
    brand_only = Column(Boolean, nullable=False, default=False)
    formulary_tier = Column(Integer, nullable=False, default=2)
    step_therapy_required = Column(Boolean, nullable=False, default=False)
    step_therapy_agents = Column(JSONB, nullable=False, default=list)

    # OTC flag
    is_otc = Column(Boolean, nullable=False, default=False)

    # RTPB identifiers (empty for v1, critical for v2)
    ndc_codes = Column(JSONB, nullable=False, default=list)
    rxnorm_cui = Column(String, nullable=True)
    gpi_code = Column(String, nullable=True)

    # Alternative pointers
    alternative_ids = Column(JSONB, nullable=False, default=list)

    # Metadata
    data_source = Column(String, nullable=False, default="public-data")
    last_updated = Column(Date, nullable=True)

    # Relationships
    diagnoses = relationship(
        "Diagnosis",
        secondary="medication_diagnoses",
        back_populates="medications"
    )
