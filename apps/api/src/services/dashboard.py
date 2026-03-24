from src.data.store import SeedStore
from src.schemas.dashboard import DashboardSummary


class DashboardService:
    def __init__(self, store: SeedStore):
        self.store = store

    def get_summary(self) -> DashboardSummary:
        return self.store.dashboard_summary()
