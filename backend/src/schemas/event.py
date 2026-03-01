from pydantic import BaseModel
from typing import Optional


class EventCreate(BaseModel):
    session_id: str
    event_type: str   # medication_searched | medication_selected | alternative_shown
                      # | alternative_selected | quick_switch_used
    medication_id: Optional[str] = None
    alternative_id: Optional[str] = None
    specialty: str = "dermatology"
    insurance_type: Optional[str] = None
    patient_age_group: Optional[str] = None


class EventResponse(BaseModel):
    id: str
    recorded: bool = True
