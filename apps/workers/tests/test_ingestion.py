import sqlite3
import asyncio
from unittest.mock import patch

from src.core.config import get_settings
from src.ingestion_backend import parse_tle_text
from src.jobs.ingestion import run_ingestion


SAMPLE_TLE = """ISS (ZARYA)
1 25544U 98067A   24084.89263889  .00016717  00000+0  10270-3 0  9991
2 25544  51.6393 137.0667 0005237  56.2766  85.4781 15.50051241442793
"""

CLASSIFIED_TLE = """COSMOS 1408 DEB
1 13552U 82092A   24084.79263889  .00006717  00000+0  10270-3 0  9991
2 13552  82.6393 137.0667 0005237  56.2766  85.4781 13.50051241442793
SL-8 R/B
1 11267U 79020B   24084.80729399  .00000077  00000+0  74987-4 0  9996
2 11267  98.5237  71.1894 0010731 354.4930   5.6217 14.26423552346900
"""


def test_parse_tle_text_extracts_entry() -> None:
    items = parse_tle_text(SAMPLE_TLE)
    assert len(items) == 1
    assert items[0].norad_id == 25544


def test_parse_tle_text_classifies_entries() -> None:
    items = parse_tle_text(CLASSIFIED_TLE)
    assert [item.object_class for item in items] == ["debris-fragment", "rocket-body"]


def test_run_ingestion_invokes_backend() -> None:
    with patch("src.jobs.ingestion.ingest_celestrak_feed", return_value=1) as ingest:
        asyncio.run(run_ingestion())

    ingest.assert_called_once()


def test_ingestion_backend_persists_rows(tmp_path, monkeypatch) -> None:
    database_path = tmp_path / "workers.sqlite3"
    monkeypatch.setenv("LOCAL_DATABASE_PATH", str(database_path))
    get_settings.cache_clear()

    from src.ingestion_backend import ingest_celestrak_feed

    try:
        ingest_celestrak_feed(CLASSIFIED_TLE)
        ingest_celestrak_feed(CLASSIFIED_TLE)

        with sqlite3.connect(database_path) as connection:
            object_count = connection.execute("SELECT COUNT(*) FROM space_objects").fetchone()[0]
            snapshot_count = connection.execute("SELECT COUNT(*) FROM tle_snapshots").fetchone()[0]
            feed_row = connection.execute(
                "SELECT source, object_count, is_stale FROM feed_statuses"
            ).fetchone()

        assert object_count == 2
        assert snapshot_count == 2
        assert feed_row == ("CelesTrak", 2, 0)
    finally:
        get_settings.cache_clear()
