from fastapi import APIRouter

from src.schemas.object import FeedStatus


router = APIRouter()


@router.get("/status", response_model=list[FeedStatus])
def status() -> list[FeedStatus]:
    return [
        FeedStatus(
            source="CelesTrak",
            lastIngestedAt="2026-03-24T00:00:00Z",
            staleThresholdMinutes=240,
            isStale=False,
        )
    ]
