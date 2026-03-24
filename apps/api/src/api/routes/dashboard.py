from fastapi import APIRouter, Depends

from src.api.dependencies import get_dashboard_service
from src.schemas.dashboard import DashboardSummary
from src.services.dashboard import DashboardService


router = APIRouter()


@router.get("/summary", response_model=DashboardSummary)
def summary(service: DashboardService = Depends(get_dashboard_service)) -> DashboardSummary:
    return service.get_summary()
