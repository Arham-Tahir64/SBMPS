from src.data.store import SeedStore
from src.schemas.object import FeedStatus


class FeedService:
    def __init__(self, store: SeedStore):
        self.store = store

    def list_feed_statuses(self) -> list[FeedStatus]:
        return self.store.feeds
