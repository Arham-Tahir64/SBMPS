from fastapi import APIRouter
from pydantic import BaseModel


class SessionUser(BaseModel):
    userId: str
    email: str
    roles: list[str]


class SessionResponse(BaseModel):
    authenticated: bool
    provider: str
    user: SessionUser


router = APIRouter()


@router.get("/session", response_model=SessionResponse)
def session() -> SessionResponse:
    return SessionResponse(
        authenticated=True,
        provider="managed-oidc-placeholder",
        user=SessionUser(
            userId="user-1",
            email="operator@example.com",
            roles=["operator", "analyst"],
        ),
    )
