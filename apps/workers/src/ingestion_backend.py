from __future__ import annotations

import sqlite3
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from pathlib import Path
from urllib.request import Request, urlopen

from src.core.config import get_settings


SCHEMA = """
CREATE TABLE IF NOT EXISTS space_objects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  norad_id INTEGER NOT NULL UNIQUE,
  object_class TEXT NOT NULL,
  source TEXT NOT NULL,
  operator_name TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tle_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  object_id TEXT NOT NULL,
  source TEXT NOT NULL,
  line0 TEXT NOT NULL,
  line1 TEXT NOT NULL,
  line2 TEXT NOT NULL,
  epoch TEXT NOT NULL,
  ingested_at TEXT NOT NULL,
  UNIQUE(object_id, source, epoch)
);

CREATE TABLE IF NOT EXISTS feed_statuses (
  source TEXT PRIMARY KEY,
  last_ingested_at TEXT,
  last_attempted_at TEXT NOT NULL,
  stale_threshold_minutes INTEGER NOT NULL,
  is_stale INTEGER NOT NULL,
  object_count INTEGER NOT NULL,
  message TEXT
);
"""


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


def _connect() -> sqlite3.Connection:
    path = Path(get_settings().local_database_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(path)
    connection.row_factory = sqlite3.Row
    return connection


def init_db() -> None:
    with _connect() as connection:
        connection.executescript(SCHEMA)
        connection.commit()


def fetch_celestrak_tles() -> str:
    settings = get_settings()
    request = Request(settings.celestrak_active_feed_url, headers={"User-Agent": "SDMPS/0.1"})
    with urlopen(request, timeout=settings.feed_request_timeout_seconds) as response:
        return response.read().decode("utf-8")


def ingest_celestrak_feed(raw_text: str | None = None) -> int:
    init_db()
    settings = get_settings()
    attempted_at = datetime.now(UTC).isoformat()

    with _connect() as connection:
        try:
            text = raw_text if raw_text is not None else fetch_celestrak_tles()
            parsed = parse_tle_text(text)
            for tle in parsed:
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
                    (
                        str(tle.norad_id),
                        tle.name,
                        tle.norad_id,
                        tle.object_class,
                        tle.source,
                        attempted_at,
                        attempted_at,
                    ),
                )
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
                    (
                        str(tle.norad_id),
                        tle.source,
                        tle.line0,
                        tle.line1,
                        tle.line2,
                        tle.epoch,
                        attempted_at,
                    ),
                )

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
                    "CelesTrak",
                    attempted_at,
                    attempted_at,
                    settings.tle_stale_threshold_minutes,
                    0,
                    len(parsed),
                    None,
                ),
            )
            connection.commit()
            return len(parsed)
        except Exception as exc:
            connection.execute(
                """
                INSERT INTO feed_statuses (
                  source, last_ingested_at, last_attempted_at, stale_threshold_minutes, is_stale, object_count, message
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(source) DO UPDATE SET
                  last_attempted_at = excluded.last_attempted_at,
                  stale_threshold_minutes = excluded.stale_threshold_minutes,
                  is_stale = excluded.is_stale,
                  object_count = excluded.object_count,
                  message = excluded.message
                """,
                (
                    "CelesTrak",
                    None,
                    attempted_at,
                    settings.tle_stale_threshold_minutes,
                    1,
                    0,
                    str(exc),
                ),
            )
            connection.commit()
            raise
