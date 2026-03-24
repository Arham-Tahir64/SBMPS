import sqlite3

import pytest
from fastapi.testclient import TestClient

from src.core.config import get_settings
from src.ingestion import parse_tle_text


SAMPLE_TLE = """ISS (ZARYA)
1 25544U 98067A   24084.89263889  .00016717  00000+0  10270-3 0  9991
2 25544  51.6393 137.0667 0005237  56.2766  85.4781 15.50051241442793
NOAA 15
1 25338U 98030A   24084.80729399  .00000077  00000+0  74987-4 0  9996
2 25338  98.5237  71.1894 0010731 354.4930   5.6217 14.26423552346900
"""

CLASSIFIED_TLE = """COSMOS 1408 DEB
1 13552U 82092A   24084.79263889  .00006717  00000+0  10270-3 0  9991
2 13552  82.6393 137.0667 0005237  56.2766  85.4781 13.50051241442793
SL-8 R/B
1 11267U 79020B   24084.80729399  .00000077  00000+0  74987-4 0  9996
2 11267  98.5237  71.1894 0010731 354.4930   5.6217 14.26423552346900
"""


@pytest.fixture()
def client(tmp_path, monkeypatch):
    database_path = tmp_path / "api.sqlite3"
    monkeypatch.setenv("LOCAL_DATABASE_PATH", str(database_path))
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{database_path}")
    get_settings.cache_clear()

    from src.main import app

    with TestClient(app) as test_client:
        yield test_client

    get_settings.cache_clear()


def test_parse_tle_text_extracts_objects() -> None:
    items = parse_tle_text(SAMPLE_TLE)
    assert len(items) == 2
    assert items[0].norad_id == 25544
    assert items[0].name == "ISS (ZARYA)"


def test_parse_tle_text_classifies_object_types() -> None:
    items = parse_tle_text(CLASSIFIED_TLE)
    assert [item.object_class for item in items] == ["debris-fragment", "rocket-body"]


def test_healthz(client: TestClient) -> None:
    response = client.get("/healthz")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_empty_persisted_state_returns_empty_lists(client: TestClient) -> None:
    response = client.get("/v1/live/snapshot")
    assert response.status_code == 200
    payload = response.json()
    assert payload["objects"] == []
    assert payload["conjunctions"] == []


def test_refresh_persists_objects_and_feed_status(client: TestClient, monkeypatch) -> None:
    monkeypatch.setattr("src.ingestion.fetch_celestrak_tles", lambda: SAMPLE_TLE)
    response = client.post("/v1/feeds/refresh")
    assert response.status_code == 200

    objects = client.get("/v1/objects").json()
    assert len(objects) == 2
    assert objects[0]["positionKm"]
    assert "noradId" in objects[0]

    feeds = client.get("/v1/feeds/status").json()
    assert feeds[0]["source"] == "CelesTrak"
    assert feeds[0]["objectCount"] == 2
    assert feeds[0]["isStale"] is False


def test_refresh_upserts_objects_and_tle_snapshots_without_duplicates(
    client: TestClient, monkeypatch
) -> None:
    monkeypatch.setattr("src.ingestion.fetch_celestrak_tles", lambda: SAMPLE_TLE)

    first = client.post("/v1/feeds/refresh")
    second = client.post("/v1/feeds/refresh")

    assert first.status_code == 200
    assert second.status_code == 200

    database_path = get_settings().local_database_path
    with sqlite3.connect(database_path) as connection:
        object_count = connection.execute("SELECT COUNT(*) FROM space_objects").fetchone()[0]
        snapshot_count = connection.execute("SELECT COUNT(*) FROM tle_snapshots").fetchone()[0]

    assert object_count == 2
    assert snapshot_count == 2


def test_refresh_failure_marks_feed_stale(client: TestClient, monkeypatch) -> None:
    def fail_fetch() -> str:
        raise RuntimeError("feed unavailable")

    monkeypatch.setattr("src.ingestion.fetch_celestrak_tles", fail_fetch)

    with pytest.raises(RuntimeError, match="feed unavailable"):
        client.post("/v1/feeds/refresh")

    feeds = client.get("/v1/feeds/status").json()
    assert feeds[0]["source"] == "CelesTrak"
    assert feeds[0]["isStale"] is True
    assert feeds[0]["message"] == "feed unavailable"
    assert "T" in feeds[0]["lastIngestedAt"]


def test_get_object_not_found(client: TestClient) -> None:
    response = client.get("/v1/objects/missing")
    assert response.status_code == 404


def test_dashboard_summary_uses_persisted_counts(client: TestClient, monkeypatch) -> None:
    monkeypatch.setattr("src.ingestion.fetch_celestrak_tles", lambda: SAMPLE_TLE)
    client.post("/v1/feeds/refresh")
    payload = client.get("/v1/dashboard/summary").json()
    assert payload["trackedObjectCount"] == 2
    assert payload["activeFeedCount"] == 1


def test_operations_events_stream(client: TestClient) -> None:
    response = client.get("/v1/live/operations/events")
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/event-stream")
    assert "event: operations" in response.text
