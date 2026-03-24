import asyncio
import json
from collections.abc import AsyncIterator

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from src.api.dependencies import get_live_service
from src.persisted_state import list_operations_events
from src.schemas.live import LiveSnapshot
from src.services.live import LiveService


router = APIRouter()

_SSE_INTERVAL_SECONDS = 10


@router.get("/snapshot", response_model=LiveSnapshot)
def snapshot(service: LiveService = Depends(get_live_service)) -> LiveSnapshot:
    return service.get_snapshot()


async def _live_event_stream() -> AsyncIterator[str]:
    """Emit current operations events every _SSE_INTERVAL_SECONDS, with heartbeat comments."""
    while True:
        events = await asyncio.to_thread(list_operations_events)
        for event in events:
            payload = json.dumps(event.model_dump())
            yield f"id: {event.eventId}\nevent: operations\ndata: {payload}\n\n"
        yield ": heartbeat\n\n"
        await asyncio.sleep(_SSE_INTERVAL_SECONDS)


@router.get("/operations/events")
async def operations_events() -> StreamingResponse:
    return StreamingResponse(
        _live_event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
