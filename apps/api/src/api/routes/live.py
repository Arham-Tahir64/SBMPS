import json
from collections.abc import Iterator

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from src.api.dependencies import get_live_service, get_operations_service
from src.schemas.live import LiveSnapshot
from src.schemas.operations import OperationsEvent
from src.services.live import LiveService
from src.services.operations import OperationsService


router = APIRouter()


@router.get("/snapshot", response_model=LiveSnapshot)
def snapshot(service: LiveService = Depends(get_live_service)) -> LiveSnapshot:
    return service.get_snapshot()


def _event_stream(events: list[OperationsEvent]) -> Iterator[str]:
    for event in events:
        payload = json.dumps(event.model_dump())
        yield f"id: {event.eventId}\n"
        yield "event: operations\n"
        yield f"data: {payload}\n\n"


@router.get("/operations/events")
def operations_events(
    service: OperationsService = Depends(get_operations_service),
) -> StreamingResponse:
    return StreamingResponse(_event_stream(service.list_events()), media_type="text/event-stream")
