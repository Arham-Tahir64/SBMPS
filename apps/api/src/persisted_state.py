from __future__ import annotations

from datetime import UTC, datetime
from math import sqrt

from sqlalchemy import and_, func, select
from sqlalchemy.orm import aliased
from sdmps_data import (
    ConjunctionEvent,
    CurrentState,
    FeedStatus as FeedStatusRecord,
    RiskAssessment,
    SpaceObject,
    TleSnapshot,
    session_scope,
)

from src.schemas.alert import AlertEvent
from src.schemas.conjunction import ConjunctionEventDetail, ConjunctionEventSummary
from src.core.config import get_settings
from src.schemas.heatmap import HeatmapBin
from src.schemas.object import FeedStatus, TrackedObjectDetail
from src.schemas.operations import OperationsEvent


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


def _conjunction_rows() -> list[dict[str, object]]:
    settings = get_settings()
    primary_object = aliased(SpaceObject)
    secondary_object = aliased(SpaceObject)

    with session_scope(settings.database_url) as session:
        rows = session.execute(
            select(ConjunctionEvent, RiskAssessment, primary_object, secondary_object)
            .join(primary_object, primary_object.id == ConjunctionEvent.primary_object_id)
            .join(secondary_object, secondary_object.id == ConjunctionEvent.secondary_object_id)
            .outerjoin(
                RiskAssessment, RiskAssessment.conjunction_event_id == ConjunctionEvent.id
            )
            .order_by(ConjunctionEvent.tca.asc(), ConjunctionEvent.id.asc())
        ).all()

    return [
        {
            "conjunction": conjunction,
            "risk": risk,
            "primary": primary,
            "secondary": secondary,
        }
        for conjunction, risk, primary, secondary in rows
    ]


def list_conjunctions() -> list[ConjunctionEventSummary]:
    summaries: list[ConjunctionEventSummary] = []
    for row in _conjunction_rows():
        conjunction = row["conjunction"]
        risk = row["risk"]
        primary = row["primary"]
        secondary = row["secondary"]
        summaries.append(
            ConjunctionEventSummary(
                id=conjunction.id,
                primaryObjectId=primary.id,
                primaryObjectName=primary.name,
                secondaryObjectId=secondary.id,
                secondaryObjectName=secondary.name,
                missDistanceKm=conjunction.miss_distance_km,
                tca=conjunction.tca.isoformat(),
                riskTier=(risk.risk_tier if risk is not None else "low"),
            )
        )
    return summaries


def get_conjunction(conjunction_id: str) -> ConjunctionEventDetail | None:
    for row in _conjunction_rows():
        conjunction = row["conjunction"]
        if conjunction.id != conjunction_id:
            continue
        risk = row["risk"]
        primary = row["primary"]
        secondary = row["secondary"]
        return ConjunctionEventDetail(
            id=conjunction.id,
            primaryObjectId=primary.id,
            primaryObjectName=primary.name,
            secondaryObjectId=secondary.id,
            secondaryObjectName=secondary.name,
            missDistanceKm=conjunction.miss_distance_km,
            tca=conjunction.tca.isoformat(),
            riskTier=(risk.risk_tier if risk is not None else "low"),
            relativeVelocityKmPerSecond=conjunction.relative_velocity_km_s,
            pcValue=(risk.pc_value if risk is not None else None),
            methodology=(risk.methodology if risk is not None else "estimated"),
        )
    return None


def list_alerts() -> list[AlertEvent]:
    alerts: list[AlertEvent] = []
    for conjunction in list_conjunctions():
        if conjunction.riskTier not in {"high", "critical"}:
            continue
        alerts.append(
            AlertEvent(
                id=conjunction.id,
                kind="conjunction",
                severity=conjunction.riskTier,
                message=(
                    f"{conjunction.primaryObjectName} and {conjunction.secondaryObjectName} are "
                    f"projected within {conjunction.missDistanceKm:.2f} km."
                ),
                createdAt=conjunction.tca,
            )
        )
    return alerts


def list_operations_events() -> list[OperationsEvent]:
    events: list[OperationsEvent] = []
    for feed in list_feed_statuses():
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

    for alert in list_alerts():
        events.append(
            OperationsEvent(
                eventId=f"conjunction-{alert.id}",
                kind="conjunction",
                severity=alert.severity,
                message=alert.message,
                createdAt=alert.createdAt,
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

    return sorted(events, key=lambda event: event.createdAt, reverse=True)


def get_dashboard_counts() -> dict[str, int]:
    conjunctions = list_conjunctions()
    feeds = list_feed_statuses()
    return {
        "trackedObjectCount": len(list_persisted_objects()),
        "highRiskConjunctionCount": sum(1 for item in conjunctions if item.riskTier == "high"),
        "criticalRiskConjunctionCount": sum(1 for item in conjunctions if item.riskTier == "critical"),
        "activeFeedCount": sum(1 for item in feeds if not item.isStale),
        "staleFeedCount": sum(1 for item in feeds if item.isStale),
    }


def list_altitude_heatmap_bins() -> list[HeatmapBin]:
    objects = list_persisted_objects()
    conjunctions = list_conjunctions()
    total_objects = len(objects)
    total_conjunctions = len(conjunctions)

    object_band_map: dict[str, tuple[int, int]] = {}
    band_object_counts = {(start, start + 100): 0 for start in range(200, 2000, 100)}
    band_risky_conjunctions = {band: set() for band in band_object_counts}

    for item in objects:
        radius = sqrt(sum(component**2 for component in item.positionKm))
        altitude = radius - 6371
        for band in band_object_counts:
            start, end = band
            if start <= altitude < end:
                band_object_counts[band] += 1
                object_band_map[item.id] = band
                break

    for conjunction in conjunctions:
        if conjunction.riskTier not in {"high", "critical"}:
            continue
        primary_band = object_band_map.get(conjunction.primaryObjectId)
        secondary_band = object_band_map.get(conjunction.secondaryObjectId)
        if primary_band is not None:
            band_risky_conjunctions[primary_band].add(conjunction.id)
        if secondary_band is not None:
            band_risky_conjunctions[secondary_band].add(conjunction.id)

    bins: list[HeatmapBin] = []
    for start in range(200, 2000, 100):
        band = (start, start + 100)
        bins.append(
            HeatmapBin(
                bandStartKm=band[0],
                bandEndKm=band[1],
                density=(band_object_counts[band] / total_objects if total_objects else 0.0),
                riskConcentration=(
                    len(band_risky_conjunctions[band]) / total_conjunctions if total_conjunctions else 0.0
                ),
            )
        )
    return bins
