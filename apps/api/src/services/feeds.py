from src.ingestion import ingest_celestrak_feed
from src.persisted_state import list_feed_statuses
from src.schemas.object import FeedStatus


class FeedService:
    def list_feed_statuses(self) -> list[FeedStatus]:
        return list_feed_statuses()

    def refresh(self) -> list[FeedStatus]:
        ingest_celestrak_feed()
        return self.list_feed_statuses()
