from datetime import UTC, datetime

from src.persisted_state import list_feed_statuses, list_persisted_objects
from src.schemas.dashboard import DashboardSummary


class DashboardService:
    def get_summary(self) -> DashboardSummary:
        objects = list_persisted_objects()
        feeds = list_feed_statuses()
        return DashboardSummary(
            epoch=(objects[0].epoch if objects else datetime.now(UTC).isoformat()),
            trackedObjectCount=len(objects),
            highRiskConjunctionCount=0,
            criticalRiskConjunctionCount=0,
            activeFeedCount=sum(1 for item in feeds if not item.isStale),
            staleFeedCount=sum(1 for item in feeds if item.isStale),
        )
