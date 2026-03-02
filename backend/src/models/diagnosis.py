from sqlalchemy import Column, String, Text, JSON, Table, ForeignKey
from sqlalchemy.orm import relationship
from src.models.medication import Base


# Many-to-many association table
medication_diagnosis_association = Table(
    'medication_diagnoses',
    Base.metadata,
    Column('medication_id', String, ForeignKey('medications.id'), primary_key=True),
    Column('diagnosis_id', String, ForeignKey('diagnoses.id'), primary_key=True)
)


class Diagnosis(Base):
    __tablename__ = "diagnoses"

    id = Column(String, primary_key=True)  # e.g., "uti", "acne-vulgaris"
    name = Column(String, nullable=False)  # "Urinary Tract Infection"
    icd10_codes = Column(JSON, nullable=False, default=list)  # ["N39.0"]
    description = Column(Text, nullable=True)
    synonyms = Column(JSON, nullable=False, default=list)  # ["UTI", "bladder infection"]
    category = Column(String, nullable=False)  # "infectious_disease", "dermatologic"

    # Relationships
    medications = relationship(
        "Medication",
        secondary=medication_diagnosis_association,
        back_populates="diagnoses"
    )
