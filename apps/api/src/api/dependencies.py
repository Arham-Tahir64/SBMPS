from src.services.conjunctions import ConjunctionService
from src.services.dashboard import DashboardService
from src.services.feeds import FeedService
from src.services.live import LiveService
from src.services.objects import ObjectService
from src.services.operations import OperationsService
from src.services.simulations import SimulationService


def get_object_service() -> ObjectService:
    return ObjectService()


def get_conjunction_service() -> ConjunctionService:
    return ConjunctionService()


def get_feed_service() -> FeedService:
    return FeedService()


def get_live_service() -> LiveService:
    return LiveService()


def get_dashboard_service() -> DashboardService:
    return DashboardService()


def get_operations_service() -> OperationsService:
    return OperationsService()


def get_simulation_service() -> SimulationService:
    return SimulationService()
