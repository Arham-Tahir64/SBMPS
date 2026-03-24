from __future__ import annotations

import sqlite3
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from urllib.request import Request, urlopen

from sgp4.api import Satrec, jday

from src.core.config import get_settings
from src.db import connect, init_db


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


def _upsert_object(connection: sqlite3.Connection, tle: ParsedTle, timestamp: str) -> None:
    connection.execute(
        """
        INSERT INTO space_objects (id, name, norad_id, object_class, source, operator_name, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, NULL, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          norad_id = excluded.norad_id,
          object_class = excluded.object_class,
          source = excluded.source,
          updated_at = excluded.updated_at
        """,
        (str(tle.norad_id), tle.name, tle.norad_id, tle.object_class, tle.source, timestamp, timestamp),
    )


def _insert_tle_snapshot(connection: sqlite3.Connection, tle: ParsedTle, timestamp: str) -> None:
    connection.execute(
        """
        INSERT INTO tle_snapshots (object_id, source, line0, line1, line2, epoch, ingested_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(object_id, source, epoch) DO UPDATE SET
          line0 = excluded.line0,
          line1 = excluded.line1,
          line2 = excluded.line2,
          ingested_at = excluded.ingested_at
        """,
        (str(tle.norad_id), tle.source, tle.line0, tle.line1, tle.line2, tle.epoch, timestamp),
    )


def _upsert_feed_status(
    connection: sqlite3.Connection,
    source: str,
    attempted_at: str,
    stale_threshold_minutes: int,
    *,
    ingested_at: str | None,
    is_stale: bool,
    object_count: int,
    message: str | None,
) -> None:
    connection.execute(
        """
        INSERT INTO feed_statuses (
          source, last_ingested_at, last_attempted_at, stale_threshold_minutes, is_stale, object_count, message
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(source) DO UPDATE SET
          last_ingested_at = excluded.last_ingested_at,
          last_attempted_at = excluded.last_attempted_at,
          stale_threshold_minutes = excluded.stale_threshold_minutes,
          is_stale = excluded.is_stale,
          object_count = excluded.object_count,
          message = excluded.message
        """,
        (
            source,
            ingested_at,
            attempted_at,
            stale_threshold_minutes,
            int(is_stale),
            object_count,
            message,
        ),
    )


def ingest_celestrak_feed(raw_text: str | None = None) -> int:
    init_db()
    settings = get_settings()
    attempted_at = datetime.now(UTC).isoformat()
    source = "CelesTrak"

    with connect() as connection:
        try:
            text = raw_text if raw_text is not None else fetch_celestrak_tles()
            parsed = parse_tle_text(text, source=source)

            for tle in parsed:
                _upsert_object(connection, tle, attempted_at)
                _insert_tle_snapshot(connection, tle, attempted_at)

            _upsert_feed_status(
                connection,
                source,
                attempted_at,
                settings.tle_stale_threshold_minutes if hasattr(settings, "tle_stale_threshold_minutes") else 240,
                ingested_at=attempted_at,
                is_stale=False,
                object_count=len(parsed),
                message=None,
            )
            connection.commit()
            return len(parsed)
        except Exception as exc:
            _upsert_feed_status(
                connection,
                source,
                attempted_at,
                settings.tle_stale_threshold_minutes,
                ingested_at=None,
                is_stale=True,
                object_count=0,
                message=str(exc),
            )
            connection.commit()
            raise


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
