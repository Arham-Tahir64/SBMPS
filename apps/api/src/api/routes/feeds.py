from fastapi import APIRouter, Depends

from src.api.dependencies import get_feed_service
from src.schemas.object import FeedStatus
from src.services.feeds import FeedService


router = APIRouter()


@router.get("/status", response_model=list[FeedStatus])
def status(service: FeedService = Depends(get_feed_service)) -> list[FeedStatus]:
    return service.list_feed_statuses()
