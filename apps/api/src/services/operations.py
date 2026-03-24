from src.data.store import SeedStore
from src.schemas.operations import OperationsEvent


class OperationsService:
    def __init__(self, store: SeedStore):
        self.store = store

    def list_events(self) -> list[OperationsEvent]:
        return self.store.events
