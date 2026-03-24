from src.data.store import SeedStore
from src.schemas.live import LiveSnapshot


class LiveService:
    def __init__(self, store: SeedStore):
        self.store = store

    def get_snapshot(self) -> LiveSnapshot:
        return self.store.snapshot()
