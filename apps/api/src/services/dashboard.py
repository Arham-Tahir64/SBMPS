from datetime import UTC, datetime

from src.persisted_state import get_dashboard_counts, get_live_epoch, list_conjunctions, list_persisted_objects
from src.schemas.dashboard import DashboardSummary


class DashboardService:
    def get_summary(self) -> DashboardSummary:
        objects = list_persisted_objects()
        conjunctions = list_conjunctions()
        counts = get_dashboard_counts()
        return DashboardSummary(
            epoch=get_live_epoch() if objects or conjunctions else datetime.now(UTC).isoformat(),
            trackedObjectCount=counts["trackedObjectCount"],
            highRiskConjunctionCount=counts["highRiskConjunctionCount"],
            criticalRiskConjunctionCount=counts["criticalRiskConjunctionCount"],
            activeFeedCount=counts["activeFeedCount"],
            staleFeedCount=counts["staleFeedCount"],
        )
