from fastapi.testclient import TestClient

from src.main import app


client = TestClient(app)


def test_healthz() -> None:
    response = client.get("/healthz")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_list_objects() -> None:
    response = client.get("/v1/objects")
    assert response.status_code == 200
    payload = response.json()
    assert payload[0]["noradId"] == 25544
    assert "objectClass" in payload[0]


def test_get_object_not_found() -> None:
    response = client.get("/v1/objects/missing")
    assert response.status_code == 404


def test_list_conjunctions() -> None:
    response = client.get("/v1/conjunctions")
    assert response.status_code == 200
    payload = response.json()
    assert payload[0]["primaryObjectId"] == "25544"
    assert payload[0]["riskTier"] == "high"


def test_get_conjunction_not_found() -> None:
    response = client.get("/v1/conjunctions/missing")
    assert response.status_code == 404


def test_live_snapshot() -> None:
    response = client.get("/v1/live/snapshot")
    assert response.status_code == 200
    payload = response.json()
    assert payload["epoch"] == "2026-03-24T00:00:00Z"
    assert len(payload["objects"]) == 3
    assert len(payload["feeds"]) == 2


def test_dashboard_summary() -> None:
    response = client.get("/v1/dashboard/summary")
    assert response.status_code == 200
    payload = response.json()
    assert payload["trackedObjectCount"] == 3
    assert payload["highRiskConjunctionCount"] == 1
    assert payload["staleFeedCount"] == 1


def test_operations_events_stream() -> None:
    response = client.get("/v1/live/operations/events")
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/event-stream")
    assert "event: operations" in response.text
    assert '"eventId": "ops-1"' in response.text
