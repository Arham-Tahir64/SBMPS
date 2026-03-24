import asyncio
import sqlite3
from unittest.mock import patch

from src.core.config import get_settings
from src.ingestion_backend import (
    parse_tle_text,
    refresh_conjunction_events,
    refresh_current_states,
    refresh_risk_assessments,
)
from src.jobs.conjunctions import run_conjunction_detection
from src.jobs.ingestion import run_ingestion
from src.jobs.propagation import run_propagation
from src.jobs.risk import compute_risk


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


def test_run_propagation_invokes_backend() -> None:
    with patch("src.jobs.propagation.refresh_current_states", return_value=1) as propagate:
        asyncio.run(run_propagation())

    propagate.assert_called_once()


def test_run_conjunction_detection_invokes_backend() -> None:
    with patch("src.jobs.conjunctions.refresh_conjunction_events", return_value=1) as detect:
        asyncio.run(run_conjunction_detection())

    detect.assert_called_once()


def test_compute_risk_invokes_backend() -> None:
    with patch("src.jobs.risk.refresh_risk_assessments", return_value=1) as assess:
        asyncio.run(compute_risk())

    assess.assert_called_once()


def test_ingestion_backend_persists_rows(tmp_path, monkeypatch) -> None:
    database_path = tmp_path / "workers.sqlite3"
    monkeypatch.setenv("LOCAL_DATABASE_PATH", str(database_path))
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{database_path}")
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


def test_propagation_persists_current_states(tmp_path, monkeypatch) -> None:
    database_path = tmp_path / "workers.sqlite3"
    monkeypatch.setenv("LOCAL_DATABASE_PATH", str(database_path))
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{database_path}")
    get_settings.cache_clear()

    from src.ingestion_backend import ingest_celestrak_feed

    try:
        ingest_celestrak_feed(CLASSIFIED_TLE)
        updated_count = refresh_current_states()

        with sqlite3.connect(database_path) as connection:
            state_count = connection.execute("SELECT COUNT(*) FROM current_states").fetchone()[0]
            sample_state = connection.execute(
                "SELECT object_id, position_x_km, velocity_x_km_s FROM current_states ORDER BY object_id ASC"
            ).fetchone()

        assert updated_count == 2
        assert state_count == 2
        assert sample_state[0] == "11267"
        assert isinstance(sample_state[1], float)
        assert isinstance(sample_state[2], float)
    finally:
        get_settings.cache_clear()


def test_conjunction_and_risk_jobs_persist_rows(tmp_path, monkeypatch) -> None:
    database_path = tmp_path / "workers.sqlite3"
    monkeypatch.setenv("LOCAL_DATABASE_PATH", str(database_path))
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{database_path}")
    get_settings.cache_clear()

    from src.ingestion_backend import ingest_celestrak_feed

    propagated_states = [
        ([7000.0, 10.0, 0.0], [0.0, 7.5, 0.0]),
        ([7000.4, 10.0, 0.0], [0.0, 7.8, 0.0]),
    ]

    try:
        ingest_celestrak_feed(CLASSIFIED_TLE)

        with patch("src.ingestion_backend.propagate_tle", side_effect=propagated_states):
            refresh_current_states()

        conjunction_count = refresh_conjunction_events()
        risk_count = refresh_risk_assessments()

        with sqlite3.connect(database_path) as connection:
            event_row = connection.execute(
                """
                SELECT primary_object_id, secondary_object_id, miss_distance_km, relative_velocity_km_s
                FROM conjunction_events
                """
            ).fetchone()
            risk_row = connection.execute(
                "SELECT conjunction_event_id, risk_tier, pc_value, methodology FROM risk_assessments"
            ).fetchone()

        assert conjunction_count == 1
        assert risk_count == 1
        assert event_row[0] == "11267"
        assert event_row[1] == "13552"
        assert round(event_row[2], 2) == 0.4
        assert round(event_row[3], 2) == 0.3
        assert risk_row[1] == "critical"
        assert risk_row[2] is None
        assert risk_row[3] == "estimated"
    finally:
        get_settings.cache_clear()


def test_conjunction_job_discards_pairs_outside_threshold(tmp_path, monkeypatch) -> None:
    database_path = tmp_path / "workers.sqlite3"
    monkeypatch.setenv("LOCAL_DATABASE_PATH", str(database_path))
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{database_path}")
    get_settings.cache_clear()

    from src.ingestion_backend import ingest_celestrak_feed

    propagated_states = [
        ([7000.0, 0.0, 0.0], [0.0, 7.5, 0.0]),
        ([7100.0, 0.0, 0.0], [0.0, 7.8, 0.0]),
    ]

    try:
        ingest_celestrak_feed(CLASSIFIED_TLE)

        with patch("src.ingestion_backend.propagate_tle", side_effect=propagated_states):
            refresh_current_states()

        conjunction_count = refresh_conjunction_events()
        risk_count = refresh_risk_assessments()

        with sqlite3.connect(database_path) as connection:
            event_count = connection.execute("SELECT COUNT(*) FROM conjunction_events").fetchone()[0]
            assessment_count = connection.execute("SELECT COUNT(*) FROM risk_assessments").fetchone()[0]

        assert conjunction_count == 0
        assert risk_count == 0
        assert event_count == 0
        assert assessment_count == 0
    finally:
        get_settings.cache_clear()
