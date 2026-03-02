from typing import Optional

import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.dependencies import get_db, get_current_clinic
from src.models.event import PrescriberEvent
from src.schemas.event import EventCreate, EventResponse

router = APIRouter(prefix="/events", tags=["events"])


def _age_group(age: Optional[int]) -> Optional[str]:
    if age is None:
        return None
    if age < 18:
        return "child"
    if age < 65:
        return "adult"
    return "senior"


@router.post("", response_model=EventResponse, status_code=201)
def log_event(
    body: EventCreate,
    db: Session = Depends(get_db),
    _clinic: str = Depends(get_current_clinic),
) -> EventResponse:
    event = PrescriberEvent(
        id=str(uuid.uuid4()),
        session_id=body.session_id,
        event_type=body.event_type,
        medication_id=body.medication_id,
        alternative_id=body.alternative_id,
        specialty=body.specialty,
        insurance_type=body.insurance_type,
        patient_age_group=body.patient_age_group,
    )
    db.add(event)
    db.commit()
    return EventResponse(id=event.id)
