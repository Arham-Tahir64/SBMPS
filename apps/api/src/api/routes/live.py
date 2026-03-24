from fastapi import APIRouter

from src.schemas.live import LiveSnapshot
from src.schemas.object import FeedStatus, TrackedObjectSummary
from src.schemas.conjunction import ConjunctionEventSummary


router = APIRouter()


@router.get("/snapshot", response_model=LiveSnapshot)
def snapshot() -> LiveSnapshot:
    objects = [
        TrackedObjectSummary(
            id="25544",
            name="ISS",
            noradId=25544,
            objectClass="active-satellite",
            riskTier="low",
            epoch="2026-03-24T00:00:00Z",
            positionKm=[6800.0, 200.0, 50.0],
        )
    ]
    conjunctions = [
        ConjunctionEventSummary(
            id="cj-1",
            primaryObjectId="25544",
            primaryObjectName="ISS",
            secondaryObjectId="40069",
            secondaryObjectName="FENGYUN FRAG",
            missDistanceKm=3.42,
            tca="2026-03-24T12:15:00Z",
            riskTier="high",
        )
    ]
    feeds = [
        FeedStatus(
            source="CelesTrak",
            lastIngestedAt="2026-03-24T00:00:00Z",
            staleThresholdMinutes=240,
            isStale=False,
        )
    ]
    return LiveSnapshot(epoch="2026-03-24T00:00:00Z", objects=objects, conjunctions=conjunctions, feeds=feeds)
