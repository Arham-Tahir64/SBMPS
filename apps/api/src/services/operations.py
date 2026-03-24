from datetime import UTC, datetime

from src.persisted_state import list_feed_statuses
from src.schemas.operations import OperationsEvent


class OperationsService:
    def list_events(self) -> list[OperationsEvent]:
        feeds = list_feed_statuses()
        events = []
        for feed in feeds:
            events.append(
                OperationsEvent(
                    eventId=f"feed-{feed.source.lower()}",
                    kind="feed-status",
                    severity="medium" if feed.isStale else "low",
                    message=(
                        f"{feed.source} is stale: {feed.message}"
                        if feed.isStale and feed.message
                        else f"{feed.source} has {feed.objectCount or 0} tracked objects available."
                    ),
                    createdAt=feed.lastIngestedAt,
                )
            )
        if not events:
            events.append(
                OperationsEvent(
                    eventId="bootstrap-empty",
                    kind="feed-status",
                    severity="medium",
                    message="No feed data has been ingested yet.",
                    createdAt=datetime.now(UTC).isoformat(),
                )
            )
        return events
