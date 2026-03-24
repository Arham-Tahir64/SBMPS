from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from urllib.request import Request, urlopen

from sgp4.api import Satrec, jday
from sqlalchemy import select
from sdmps_data import CurrentState, FeedStatus, SpaceObject, TleSnapshot, init_database, session_scope

from src.core.config import get_settings


@dataclass
class ParsedTle:
    name: str
    norad_id: int
    line0: str
    line1: str
    line2: str
    epoch: str
    object_class: str = "active-satellite"
    source: str = "CelesTrak"


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

        norad_id = int(line1[2:7])
        epoch = _tle_epoch_to_iso(line1[18:32].strip())
        parsed.append(
            ParsedTle(
                name=line0,
                norad_id=norad_id,
                line0=line0,
                line1=line1,
                line2=line2,
                epoch=epoch,
                object_class=_classify_object_name(line0),
                source=source,
            )
        )

    return parsed


def fetch_celestrak_tles() -> str:
    settings = get_settings()
    request = Request(settings.celestrak_active_feed_url, headers={"User-Agent": "SDMPS/0.1"})
    with urlopen(request, timeout=settings.feed_request_timeout_seconds) as response:
        return response.read().decode("utf-8")


def _upsert_object(session, tle: ParsedTle, timestamp: datetime) -> None:
    object_id = str(tle.norad_id)
    record = session.get(SpaceObject, object_id)
    if record is None:
        session.add(
            SpaceObject(
                id=object_id,
                name=tle.name,
                norad_id=tle.norad_id,
                object_class=tle.object_class,
                source=tle.source,
                operator_name=None,
                created_at=timestamp,
                updated_at=timestamp,
            )
        )
        return

    record.name = tle.name
    record.norad_id = tle.norad_id
    record.object_class = tle.object_class
    record.source = tle.source
    record.updated_at = timestamp


def _upsert_tle_snapshot(session, tle: ParsedTle, timestamp: datetime) -> None:
    snapshot = session.scalar(
        select(TleSnapshot).where(
            TleSnapshot.object_id == str(tle.norad_id),
            TleSnapshot.source == tle.source,
            TleSnapshot.epoch == datetime.fromisoformat(tle.epoch),
        )
    )
    if snapshot is None:
        session.add(
            TleSnapshot(
                object_id=str(tle.norad_id),
                source=tle.source,
                line0=tle.line0,
                line1=tle.line1,
                line2=tle.line2,
                epoch=datetime.fromisoformat(tle.epoch),
                ingested_at=timestamp,
            )
        )
        return

    snapshot.line0 = tle.line0
    snapshot.line1 = tle.line1
    snapshot.line2 = tle.line2
    snapshot.ingested_at = timestamp


def _upsert_current_state(session, tle: ParsedTle, timestamp: datetime) -> None:
    position, velocity = propagate_tle(tle.line1, tle.line2)
    record = session.scalar(select(CurrentState).where(CurrentState.object_id == str(tle.norad_id)))
    if record is None:
        session.add(
            CurrentState(
                object_id=str(tle.norad_id),
                epoch=datetime.fromisoformat(tle.epoch),
                propagated_at=timestamp,
                position_x_km=position[0],
                position_y_km=position[1],
                position_z_km=position[2],
                velocity_x_km_s=velocity[0],
                velocity_y_km_s=velocity[1],
                velocity_z_km_s=velocity[2],
            )
        )
        return

    record.epoch = datetime.fromisoformat(tle.epoch)
    record.propagated_at = timestamp
    record.position_x_km = position[0]
    record.position_y_km = position[1]
    record.position_z_km = position[2]
    record.velocity_x_km_s = velocity[0]
    record.velocity_y_km_s = velocity[1]
    record.velocity_z_km_s = velocity[2]


def _upsert_feed_status(
    session,
    source: str,
    attempted_at: datetime,
    stale_threshold_minutes: int,
    *,
    ingested_at: datetime | None,
    is_stale: bool,
    object_count: int,
    message: str | None,
) -> None:
    status = session.get(FeedStatus, source)
    if status is None:
        session.add(
            FeedStatus(
                source=source,
                last_ingested_at=ingested_at,
                last_attempted_at=attempted_at,
                stale_threshold_minutes=stale_threshold_minutes,
                is_stale=is_stale,
                object_count=object_count,
                message=message,
            )
        )
        return

    status.last_ingested_at = ingested_at
    status.last_attempted_at = attempted_at
    status.stale_threshold_minutes = stale_threshold_minutes
    status.is_stale = is_stale
    status.object_count = object_count
    status.message = message


def ingest_celestrak_feed(raw_text: str | None = None) -> int:
    settings = get_settings()
    init_database(settings.database_url)
    attempted_at = datetime.now(UTC)
    source = "CelesTrak"

    try:
        text = raw_text if raw_text is not None else fetch_celestrak_tles()
        parsed = parse_tle_text(text, source=source)
    except Exception as exc:
        with session_scope(settings.database_url) as session:
            _upsert_feed_status(
                session,
                source,
                attempted_at,
                settings.tle_stale_threshold_minutes,
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
            _upsert_current_state(session, tle, attempted_at)

        _upsert_feed_status(
            session,
            source,
            attempted_at,
            settings.tle_stale_threshold_minutes,
            ingested_at=attempted_at,
            is_stale=False,
            object_count=len(parsed),
            message=None,
        )

    return len(parsed)


def propagate_tle(line1: str, line2: str) -> tuple[list[float], list[float]]:
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
