import sqlite3
from datetime import UTC, datetime, timedelta

import pytest
from fastapi.testclient import TestClient
from sdmps_data import ConjunctionEvent, RiskAssessment, TleSnapshot, init_database, session_scope

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
    init_database(f"sqlite:///{database_path}")

    from src.main import app

    with TestClient(app) as test_client:
        yield test_client

    get_settings.cache_clear()


def seed_conjunction_event(
    *,
    conjunction_id: str = "cj-1",
    primary_object_id: str = "25338",
    secondary_object_id: str = "25544",
    tca: str = "2026-03-24T01:20:00+00:00",
    miss_distance_km: float = 4.2,
    relative_velocity_km_s: float = 12.4,
    risk_tier: str = "high",
) -> None:
    settings = get_settings()
    with session_scope(settings.database_url) as session:
        session.add(
            ConjunctionEvent(
                id=conjunction_id,
                primary_object_id=primary_object_id,
                secondary_object_id=secondary_object_id,
                tca=datetime.fromisoformat(tca),
                miss_distance_km=miss_distance_km,
                relative_velocity_km_s=relative_velocity_km_s,
            )
        )
        session.add(
            RiskAssessment(
                conjunction_event_id=conjunction_id,
                risk_tier=risk_tier,
                pc_value=None,
                methodology="estimated",
                assessed_at=datetime.fromisoformat(tca),
            )
        )


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


def test_live_snapshot_includes_persisted_conjunctions(client: TestClient, monkeypatch) -> None:
    monkeypatch.setattr("src.ingestion.fetch_celestrak_tles", lambda: SAMPLE_TLE)
    client.post("/v1/feeds/refresh")
    seed_conjunction_event()

    payload = client.get("/v1/live/snapshot").json()
    assert len(payload["conjunctions"]) == 1
    assert payload["conjunctions"][0]["id"] == "cj-1"
    assert payload["conjunctions"][0]["riskTier"] == "high"


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
        current_state_count = connection.execute("SELECT COUNT(*) FROM current_states").fetchone()[0]

    assert object_count == 2
    assert snapshot_count == 2
    assert current_state_count == 2


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
    seed_conjunction_event()
    payload = client.get("/v1/dashboard/summary").json()
    assert payload["trackedObjectCount"] == 2
    assert payload["activeFeedCount"] == 1
    assert payload["highRiskConjunctionCount"] == 1
    assert payload["criticalRiskConjunctionCount"] == 0


def test_conjunction_detail_and_alerts_read_from_persisted_state(
    client: TestClient, monkeypatch
) -> None:
    monkeypatch.setattr("src.ingestion.fetch_celestrak_tles", lambda: SAMPLE_TLE)
    client.post("/v1/feeds/refresh")
    seed_conjunction_event()

    conjunctions = client.get("/v1/conjunctions").json()
    assert len(conjunctions) == 1

    detail = client.get("/v1/conjunctions/cj-1").json()
    assert detail["id"] == "cj-1"
    assert detail["methodology"] == "estimated"
    assert detail["pcValue"] is None
    assert detail["relativeVelocityKmPerSecond"] == pytest.approx(12.4)

    alerts = client.get("/v1/alerts").json()
    assert len(alerts) == 1
    assert alerts[0]["id"] == "cj-1"
    assert alerts[0]["severity"] == "high"


def test_heatmap_uses_persisted_current_state_and_conjunctions(client: TestClient, monkeypatch) -> None:
    monkeypatch.setattr("src.ingestion.fetch_celestrak_tles", lambda: SAMPLE_TLE)
    client.post("/v1/feeds/refresh")
    seed_conjunction_event()

    bins = client.get("/v1/heatmaps/altitude").json()
    assert len(bins) == 18
    assert any(item["density"] > 0 for item in bins)
    assert any(item["riskConcentration"] > 0 for item in bins)


def test_latest_snapshot_suppresses_stale_states_and_sets_epoch(client: TestClient, monkeypatch) -> None:
    monkeypatch.setattr("src.ingestion.fetch_celestrak_tles", lambda: SAMPLE_TLE)
    client.post("/v1/feeds/refresh")

    future_snapshot_epoch = datetime(2026, 3, 25, 2, 0, tzinfo=UTC)
    future_ingest_time = future_snapshot_epoch + timedelta(minutes=5)
    settings = get_settings()
    with session_scope(settings.database_url) as session:
        session.add(
            TleSnapshot(
                object_id="25544",
                source="CelesTrak",
                line0="ISS (ZARYA)",
                line1="1 25544U 98067A   26085.08333333  .00016717  00000+0  10270-3 0  9991",
                line2="2 25544  51.6393 137.0667 0005237  56.2766  85.4781 15.50051241442793",
                epoch=future_snapshot_epoch,
                ingested_at=future_ingest_time,
            )
        )

    objects = client.get("/v1/objects").json()
    iss = next(item for item in objects if item["id"] == "25544")
    assert iss["epoch"].startswith("2026-03-25T02:00:00")
    assert iss["positionKm"] == [0.0, 0.0, 0.0]

    live = client.get("/v1/live/snapshot").json()
    dashboard = client.get("/v1/dashboard/summary").json()
    assert live["epoch"].startswith("2026-03-25T02:00:00")
    assert dashboard["epoch"].startswith("2026-03-25T02:00:00")

    bins = client.get("/v1/heatmaps/altitude").json()
    assert pytest.approx(sum(item["density"] for item in bins), rel=1e-6) == 1.0


def test_operations_events_stream(client: TestClient) -> None:
    response = client.get("/v1/live/operations/events")
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/event-stream")
    assert "event: operations" in response.text


def test_operations_events_include_conjunction_alerts(client: TestClient, monkeypatch) -> None:
    monkeypatch.setattr("src.ingestion.fetch_celestrak_tles", lambda: SAMPLE_TLE)
    client.post("/v1/feeds/refresh")
    seed_conjunction_event(risk_tier="critical", miss_distance_km=0.7)

    response = client.get("/v1/live/operations/events")
    assert response.status_code == 200
    assert "conjunction-cj-1" in response.text
    assert '"kind": "conjunction"' in response.text
