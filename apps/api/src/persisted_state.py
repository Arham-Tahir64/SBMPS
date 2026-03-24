from __future__ import annotations

from datetime import UTC, datetime

from src.db import connect
from src.ingestion import propagate_tle
from src.schemas.object import FeedStatus, TrackedObjectDetail


def list_feed_statuses() -> list[FeedStatus]:
    with connect() as connection:
        rows = connection.execute(
            """
            SELECT source,
                   last_ingested_at,
                   last_attempted_at,
                   stale_threshold_minutes,
                   is_stale,
                   object_count,
                   message
            FROM feed_statuses
            ORDER BY source ASC
            """
        ).fetchall()

    statuses = []
    for row in rows:
        last_ingested_at = (
            row["last_ingested_at"] or row["last_attempted_at"] or datetime.now(UTC).isoformat()
        )
        statuses.append(
            FeedStatus(
                source=row["source"],
                lastIngestedAt=last_ingested_at,
                staleThresholdMinutes=row["stale_threshold_minutes"],
                isStale=bool(row["is_stale"]),
                objectCount=row["object_count"],
                message=row["message"],
            )
        )
    return statuses


def _latest_tle_rows() -> list[dict]:
    with connect() as connection:
        rows = connection.execute(
            """
            WITH ranked_snapshots AS (
              SELECT ts.object_id,
                     ts.line1,
                     ts.line2,
                     ts.epoch,
                     ts.ingested_at,
                     ROW_NUMBER() OVER (
                       PARTITION BY ts.object_id
                       ORDER BY ts.epoch DESC, ts.ingested_at DESC, ts.id DESC
                     ) AS row_number
              FROM tle_snapshots ts
            )
            SELECT so.id,
                   so.name,
                   so.norad_id,
                   so.object_class,
                   so.source,
                   so.operator_name,
                   rs.line1,
                   rs.line2,
                   rs.epoch,
                   rs.ingested_at
            FROM space_objects so
            JOIN ranked_snapshots rs
              ON rs.object_id = so.id
             AND rs.row_number = 1
            ORDER BY so.name ASC
            """
        ).fetchall()
    return [dict(row) for row in rows]


def list_persisted_objects() -> list[TrackedObjectDetail]:
    items: list[TrackedObjectDetail] = []
    for row in _latest_tle_rows():
        position, velocity = propagate_tle(row["line1"], row["line2"])
        items.append(
            TrackedObjectDetail(
                id=row["id"],
                name=row["name"],
                noradId=row["norad_id"],
                objectClass=row["object_class"],
                riskTier="low",
                epoch=row["epoch"],
                positionKm=position,
                velocityKmPerSecond=velocity,
                operatorName=row["operator_name"],
                source=row["source"],
            )
        )
    return items


def get_persisted_object(object_id: str) -> TrackedObjectDetail | None:
    for item in list_persisted_objects():
        if item.id == object_id:
            return item
    return None
