from __future__ import annotations

from datetime import UTC, datetime

from sqlalchemy import and_, func, select
from sdmps_data import CurrentState, FeedStatus as FeedStatusRecord, SpaceObject, TleSnapshot, session_scope

from src.core.config import get_settings
from src.schemas.object import FeedStatus, TrackedObjectDetail


def list_feed_statuses() -> list[FeedStatus]:
    settings = get_settings()
    with session_scope(settings.database_url) as session:
        rows = session.scalars(select(FeedStatusRecord).order_by(FeedStatusRecord.source.asc())).all()

    statuses = []
    for row in rows:
        last_ingested_at = row.last_ingested_at or row.last_attempted_at or datetime.now(UTC)
        statuses.append(
            FeedStatus(
                source=row.source,
                lastIngestedAt=last_ingested_at.isoformat(),
                staleThresholdMinutes=row.stale_threshold_minutes,
                isStale=bool(row.is_stale),
                objectCount=row.object_count,
                message=row.message,
            )
        )
    return statuses


def _latest_rows() -> list[dict[str, object]]:
    settings = get_settings()
    latest_ingest = (
        select(TleSnapshot.object_id, func.max(TleSnapshot.ingested_at).label("latest_ingested_at"))
        .group_by(TleSnapshot.object_id)
        .subquery()
    )

    with session_scope(settings.database_url) as session:
        rows = session.execute(
            select(SpaceObject, TleSnapshot, CurrentState)
            .select_from(TleSnapshot)
            .join(
                latest_ingest,
                and_(
                    latest_ingest.c.object_id == TleSnapshot.object_id,
                    latest_ingest.c.latest_ingested_at == TleSnapshot.ingested_at,
                ),
            )
            .join(SpaceObject, SpaceObject.id == TleSnapshot.object_id)
            .outerjoin(CurrentState, CurrentState.object_id == SpaceObject.id)
            .order_by(SpaceObject.name.asc())
        ).all()

    return [
        {"space_object": space_object, "tle_snapshot": tle_snapshot, "current_state": current_state}
        for space_object, tle_snapshot, current_state in rows
    ]


def list_persisted_objects() -> list[TrackedObjectDetail]:
    items: list[TrackedObjectDetail] = []
    for row in _latest_rows():
        space_object = row["space_object"]
        tle_snapshot = row["tle_snapshot"]
        current_state = row["current_state"]
        position = [
            current_state.position_x_km if current_state is not None else 0.0,
            current_state.position_y_km if current_state is not None else 0.0,
            current_state.position_z_km if current_state is not None else 0.0,
        ]
        velocity = [
            current_state.velocity_x_km_s if current_state is not None else 0.0,
            current_state.velocity_y_km_s if current_state is not None else 0.0,
            current_state.velocity_z_km_s if current_state is not None else 0.0,
        ]
        items.append(
            TrackedObjectDetail(
                id=space_object.id,
                name=space_object.name,
                noradId=space_object.norad_id,
                objectClass=space_object.object_class,
                riskTier="low",
                epoch=tle_snapshot.epoch.isoformat(),
                positionKm=position,
                velocityKmPerSecond=velocity,
                operatorName=space_object.operator_name,
                source=space_object.source,
            )
        )
    return items


def get_persisted_object(object_id: str) -> TrackedObjectDetail | None:
    for item in list_persisted_objects():
        if item.id == object_id:
            return item
    return None
