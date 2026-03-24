from fastapi import APIRouter

from src.schemas.object import TrackedObjectDetail, TrackedObjectSummary


router = APIRouter()


def _sample_object() -> TrackedObjectDetail:
    return TrackedObjectDetail(
        id="25544",
        name="ISS",
        noradId=25544,
        objectClass="active-satellite",
        riskTier="low",
        epoch="2026-03-24T00:00:00Z",
        positionKm=[6800.0, 200.0, 50.0],
        velocityKmPerSecond=[7.66, 0.01, 0.02],
        operatorName="NASA",
        source="CelesTrak",
    )


@router.get("", response_model=list[TrackedObjectSummary])
def list_objects() -> list[TrackedObjectSummary]:
    sample = _sample_object()
    return [
        TrackedObjectSummary(**sample.model_dump(exclude={"velocityKmPerSecond", "operatorName", "source"}))
    ]


@router.get("/{object_id}", response_model=TrackedObjectDetail)
def get_object(object_id: str) -> TrackedObjectDetail:
    sample = _sample_object()
    return sample.model_copy(update={"id": object_id})
