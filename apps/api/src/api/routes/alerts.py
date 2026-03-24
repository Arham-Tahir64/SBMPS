from fastapi import APIRouter
from pydantic import BaseModel


class AlertEvent(BaseModel):
    id: str
    kind: str
    severity: str
    message: str
    createdAt: str


router = APIRouter()


@router.get("", response_model=list[AlertEvent])
def list_alerts() -> list[AlertEvent]:
    return [
        AlertEvent(
            id="alert-1",
            kind="conjunction",
            severity="high",
            message="ISS and FENGYUN FRAG are below 5 km miss distance.",
            createdAt="2026-03-24T01:20:00Z",
        )
    ]
