from datetime import UTC, datetime

from src.persisted_state import list_feed_statuses, list_persisted_objects
from src.schemas.live import LiveSnapshot


class LiveService:
    def get_snapshot(self) -> LiveSnapshot:
        objects = [item.to_summary() for item in list_persisted_objects()]
        feeds = list_feed_statuses()
        return LiveSnapshot(
            epoch=(objects[0].epoch if objects else datetime.now(UTC).isoformat()),
            objects=objects,
            conjunctions=[],
            feeds=feeds,
        )
