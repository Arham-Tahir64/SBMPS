from fastapi import APIRouter

from src.persisted_state import list_alerts as list_persisted_alerts
from src.schemas.alert import AlertEvent


router = APIRouter()


@router.get("", response_model=list[AlertEvent])
def list_alerts() -> list[AlertEvent]:
    return list_persisted_alerts()
