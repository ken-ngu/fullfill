from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from src.auth.service import authenticate_clinic, create_token

router = APIRouter(prefix="/auth", tags=["auth"])


class TokenRequest(BaseModel):
    clinic_code: str
    pin: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in_hours: int = 8


@router.post("/token", response_model=TokenResponse)
def get_token(body: TokenRequest) -> TokenResponse:
    if not authenticate_clinic(body.clinic_code, body.pin):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid clinic code or PIN",
        )
    token = create_token(body.clinic_code)
    return TokenResponse(access_token=token)
