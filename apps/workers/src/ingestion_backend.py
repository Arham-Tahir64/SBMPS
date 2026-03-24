from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from itertools import combinations
from math import sqrt

from sqlalchemy import and_, delete, func, select
from sdmps_data import (
    ConjunctionEvent,
    CurrentState,
    FeedStatus,
    RiskAssessment,
    SpaceObject,
    TleSnapshot,
    init_database,
    session_scope,
)
from sdmps_integrations import CelesTrakClient

from src.core.config import get_settings


@dataclass
class ParsedTle:
    name: str
    norad_id: int
    line0: str
    line1: str
    line2: str
    epoch: str
    source: str = "CelesTrak"
    object_class: str = "active-satellite"


def _normalize_object_name(raw_name: str, fallback_norad_id: str) -> str:
    candidate = raw_name.strip()
    if candidate.startswith("0 "):
        candidate = candidate[2:].strip()
    return candidate or f"OBJECT {fallback_norad_id}"


def _classify_object_name(name: str) -> str:
    normalized = name.upper()
    if " DEB" in normalized or " FRAG" in normalized:
        return "debris-fragment"
    if "R/B" in normalized or "ROCKET BODY" in normalized:
        return "rocket-body"
    return "active-satellite"


def _tle_epoch_to_iso(raw_epoch: str) -> str:
    year_prefix = int(raw_epoch[:2])
    day_of_year = float(raw_epoch[2:])
    year = 2000 + year_prefix if year_prefix < 57 else 1900 + year_prefix
    start = datetime(year, 1, 1, tzinfo=UTC)
    return (start + timedelta(days=day_of_year - 1)).isoformat()


def parse_tle_text(raw_text: str, source: str = "CelesTrak") -> list[ParsedTle]:
    lines = [line.strip() for line in raw_text.splitlines() if line.strip()]
    parsed: list[ParsedTle] = []
    index = 0

    while index < len(lines):
        if lines[index].startswith("1 ") and index + 1 < len(lines) and lines[index + 1].startswith("2 "):
            fallback_norad_id = lines[index][2:7].strip()
            line0 = _normalize_object_name("", fallback_norad_id)
            line1 = lines[index]
            line2 = lines[index + 1]
            index += 2
        elif (
            index + 2 < len(lines)
            and not lines[index].startswith("1 ")
            and lines[index + 1].startswith("1 ")
            and lines[index + 2].startswith("2 ")
        ):
            fallback_norad_id = lines[index + 1][2:7].strip()
            line0 = _normalize_object_name(lines[index], fallback_norad_id)
            line1 = lines[index + 1]
            line2 = lines[index + 2]
            index += 3
        else:
            index += 1
            continue

        parsed.append(
            ParsedTle(
                name=line0,
                norad_id=int(line1[2:7]),
                line0=line0,
                line1=line1,
                line2=line2,
                epoch=_tle_epoch_to_iso(line1[18:32].strip()),
                source=source,
                object_class=_classify_object_name(line0),
            )
        )

    return parsed


def init_db() -> None:
    init_database(get_settings().database_url)


def fetch_celestrak_tles() -> str:
    settings = get_settings()
    client = CelesTrakClient(settings.celestrak_active_feed_url)
    return client.fetch_active_tles(settings.feed_request_timeout_seconds)


def _upsert_object(session, tle: ParsedTle, attempted_at: datetime) -> None:
    record = session.get(SpaceObject, str(tle.norad_id))
    if record is None:
        record = SpaceObject(
            id=str(tle.norad_id),
            name=tle.name,
            norad_id=tle.norad_id,
            object_class=tle.object_class,
            source=tle.source,
            operator_name=None,
            created_at=attempted_at,
            updated_at=attempted_at,
        )
        session.add(record)
        return

    record.name = tle.name
    record.norad_id = tle.norad_id
    record.object_class = tle.object_class
    record.source = tle.source
    record.updated_at = attempted_at


def _upsert_tle_snapshot(session, tle: ParsedTle, attempted_at: datetime) -> None:
    epoch = datetime.fromisoformat(tle.epoch)
    record = session.scalar(
        select(TleSnapshot).where(
            TleSnapshot.object_id == str(tle.norad_id),
            TleSnapshot.source == tle.source,
            TleSnapshot.epoch == epoch,
        )
    )
    if record is None:
        session.add(
            TleSnapshot(
                object_id=str(tle.norad_id),
                source=tle.source,
                line0=tle.line0,
                line1=tle.line1,
                line2=tle.line2,
                epoch=epoch,
                ingested_at=attempted_at,
            )
        )
        return

    record.line0 = tle.line0
    record.line1 = tle.line1
    record.line2 = tle.line2
    record.ingested_at = attempted_at


def _upsert_feed_status(
    session,
    *,
    attempted_at: datetime,
    ingested_at: datetime | None,
    is_stale: bool,
    object_count: int,
    message: str | None,
) -> None:
    settings = get_settings()
    record = session.get(FeedStatus, "CelesTrak")
    if record is None:
        record = FeedStatus(
            source="CelesTrak",
            last_ingested_at=ingested_at,
            last_attempted_at=attempted_at,
            stale_threshold_minutes=settings.tle_stale_threshold_minutes,
            is_stale=is_stale,
            object_count=object_count,
            message=message,
        )
        session.add(record)
        return

    record.last_ingested_at = ingested_at
    record.last_attempted_at = attempted_at
    record.stale_threshold_minutes = settings.tle_stale_threshold_minutes
    record.is_stale = is_stale
    record.object_count = object_count
    record.message = message


def ingest_celestrak_feed(raw_text: str | None = None) -> int:
    init_db()
    attempted_at = datetime.now(UTC)
    settings = get_settings()

    try:
        text = raw_text if raw_text is not None else fetch_celestrak_tles()
        parsed = parse_tle_text(text)
    except Exception as exc:
        with session_scope(settings.database_url) as session:
            _upsert_feed_status(
                session,
                attempted_at=attempted_at,
                ingested_at=None,
                is_stale=True,
                object_count=0,
                message=str(exc),
            )
        raise

    with session_scope(settings.database_url) as session:
        for tle in parsed:
            _upsert_object(session, tle, attempted_at)
            _upsert_tle_snapshot(session, tle, attempted_at)

        _upsert_feed_status(
            session,
            attempted_at=attempted_at,
            ingested_at=attempted_at,
            is_stale=False,
            object_count=len(parsed),
            message=None,
        )

    return len(parsed)


def propagate_tle(line1: str, line2: str) -> tuple[list[float], list[float]]:
    try:
        from sgp4.api import Satrec, jday
    except ModuleNotFoundError:
        return [0.0, 0.0, 0.0], [0.0, 0.0, 0.0]

    satellite = Satrec.twoline2rv(line1, line2)
    now = datetime.now(UTC)
    jd, fr = jday(
        now.year,
        now.month,
        now.day,
        now.hour,
        now.minute,
        now.second + (now.microsecond / 1_000_000),
    )
    error, position, velocity = satellite.sgp4(jd, fr)
    if error != 0:
        return [0.0, 0.0, 0.0], [0.0, 0.0, 0.0]
    return [float(value) for value in position], [float(value) for value in velocity]


def refresh_current_states() -> int:
    init_db()
    settings = get_settings()
    latest_ingest = (
        select(TleSnapshot.object_id, func.max(TleSnapshot.ingested_at).label("latest_ingested_at"))
        .group_by(TleSnapshot.object_id)
        .subquery()
    )

    with session_scope(settings.database_url) as session:
        rows = session.execute(
            select(TleSnapshot)
            .join(
                latest_ingest,
                and_(
                    latest_ingest.c.object_id == TleSnapshot.object_id,
                    latest_ingest.c.latest_ingested_at == TleSnapshot.ingested_at,
                ),
            )
            .order_by(TleSnapshot.object_id.asc())
        ).scalars()

        updated_count = 0
        propagated_at = datetime.now(UTC)
        for tle_snapshot in rows:
            position, velocity = propagate_tle(tle_snapshot.line1, tle_snapshot.line2)
            state = session.scalar(
                select(CurrentState).where(CurrentState.object_id == tle_snapshot.object_id)
            )
            if state is None:
                state = CurrentState(
                    object_id=tle_snapshot.object_id,
                    epoch=propagated_at,
                    propagated_at=propagated_at,
                    position_x_km=position[0],
                    position_y_km=position[1],
                    position_z_km=position[2],
                    velocity_x_km_s=velocity[0],
                    velocity_y_km_s=velocity[1],
                    velocity_z_km_s=velocity[2],
                )
                session.add(state)
            else:
                state.epoch = propagated_at
                state.propagated_at = propagated_at
                state.position_x_km = position[0]
                state.position_y_km = position[1]
                state.position_z_km = position[2]
                state.velocity_x_km_s = velocity[0]
                state.velocity_y_km_s = velocity[1]
                state.velocity_z_km_s = velocity[2]
            updated_count += 1

    return updated_count


def _distance_km(left: CurrentState, right: CurrentState) -> float:
    delta_x = left.position_x_km - right.position_x_km
    delta_y = left.position_y_km - right.position_y_km
    delta_z = left.position_z_km - right.position_z_km
    return sqrt((delta_x * delta_x) + (delta_y * delta_y) + (delta_z * delta_z))


def _relative_velocity_km_s(left: CurrentState, right: CurrentState) -> float:
    delta_x = left.velocity_x_km_s - right.velocity_x_km_s
    delta_y = left.velocity_y_km_s - right.velocity_y_km_s
    delta_z = left.velocity_z_km_s - right.velocity_z_km_s
    return sqrt((delta_x * delta_x) + (delta_y * delta_y) + (delta_z * delta_z))


def refresh_conjunction_events(max_miss_distance_km: float = 25.0) -> int:
    init_db()
    settings = get_settings()

    with session_scope(settings.database_url) as session:
        states = list(session.scalars(select(CurrentState).order_by(CurrentState.object_id.asc())))
        session.execute(delete(RiskAssessment))
        session.execute(delete(ConjunctionEvent))

        created_count = 0
        for left_state, right_state in combinations(states, 2):
            miss_distance_km = _distance_km(left_state, right_state)
            if miss_distance_km > max_miss_distance_km:
                continue

            primary_object_id, secondary_object_id = sorted(
                [left_state.object_id, right_state.object_id],
                key=lambda object_id: int(object_id),
            )
            tca = left_state.epoch if left_state.epoch >= right_state.epoch else right_state.epoch
            event = ConjunctionEvent(
                id=f"{primary_object_id}-{secondary_object_id}-{tca.isoformat()}",
                primary_object_id=primary_object_id,
                secondary_object_id=secondary_object_id,
                tca=tca,
                miss_distance_km=miss_distance_km,
                relative_velocity_km_s=_relative_velocity_km_s(left_state, right_state),
            )
            session.add(event)
            created_count += 1

    return created_count


def _risk_tier_for_miss_distance(miss_distance_km: float) -> str:
    if miss_distance_km < 1:
        return "critical"
    if miss_distance_km < 5:
        return "high"
    if miss_distance_km < 10:
        return "medium"
    return "low"


def refresh_risk_assessments() -> int:
    init_db()
    settings = get_settings()

    with session_scope(settings.database_url) as session:
        session.execute(delete(RiskAssessment))
        events = list(session.scalars(select(ConjunctionEvent).order_by(ConjunctionEvent.tca.asc())))

        created_count = 0
        assessed_at = datetime.now(UTC)
        for event in events:
            session.add(
                RiskAssessment(
                    conjunction_event_id=event.id,
                    risk_tier=_risk_tier_for_miss_distance(event.miss_distance_km),
                    pc_value=None,
                    methodology="estimated",
                    assessed_at=assessed_at,
                )
            )
            created_count += 1

    return created_count
