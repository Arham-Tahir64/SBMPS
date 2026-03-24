from fastapi import APIRouter

from src.schemas.conjunction import ConjunctionEventDetail, ConjunctionEventSummary


router = APIRouter()


def _sample_conjunction() -> ConjunctionEventDetail:
    return ConjunctionEventDetail(
        id="cj-1",
        primaryObjectId="25544",
        primaryObjectName="ISS",
        secondaryObjectId="40069",
        secondaryObjectName="FENGYUN FRAG",
        missDistanceKm=3.42,
        tca="2026-03-24T12:15:00Z",
        riskTier="high",
        relativeVelocityKmPerSecond=12.3,
        pcValue=None,
        methodology="estimated",
    )


@router.get("", response_model=list[ConjunctionEventSummary])
def list_conjunctions() -> list[ConjunctionEventSummary]:
    sample = _sample_conjunction()
    return [ConjunctionEventSummary(**sample.model_dump(exclude={"relativeVelocityKmPerSecond", "pcValue", "methodology"}))]


@router.get("/{conjunction_id}", response_model=ConjunctionEventDetail)
def get_conjunction(conjunction_id: str) -> ConjunctionEventDetail:
    sample = _sample_conjunction()
    return sample.model_copy(update={"id": conjunction_id})
