from src.data.store import store
from src.services.conjunctions import ConjunctionService
from src.services.dashboard import DashboardService
from src.services.feeds import FeedService
from src.services.live import LiveService
from src.services.objects import ObjectService
from src.services.operations import OperationsService


def get_object_service() -> ObjectService:
    return ObjectService(store)


def get_conjunction_service() -> ConjunctionService:
    return ConjunctionService(store)


def get_feed_service() -> FeedService:
    return FeedService(store)


def get_live_service() -> LiveService:
    return LiveService(store)


def get_dashboard_service() -> DashboardService:
    return DashboardService(store)


def get_operations_service() -> OperationsService:
    return OperationsService(store)
