from fastapi import APIRouter, Depends, Query

from src.api.dependencies import get_object_service
from src.schemas.object import ObjectTrajectory, TrackedObjectDetail, TrackedObjectSummary
from src.services.objects import ObjectService


router = APIRouter()


@router.get("", response_model=list[TrackedObjectSummary])
def list_objects(service: ObjectService = Depends(get_object_service)) -> list[TrackedObjectSummary]:
    return service.list_objects()


@router.get("/{object_id}/trajectory", response_model=ObjectTrajectory)
def get_object_trajectory(
    object_id: str,
    minutes: int = Query(default=180, ge=1, le=1440, description="Horizon in minutes (1–1440)"),
    service: ObjectService = Depends(get_object_service),
) -> ObjectTrajectory:
    return service.get_trajectory(object_id, minutes=minutes)


@router.get("/{object_id}", response_model=TrackedObjectDetail)
def get_object(
    object_id: str, service: ObjectService = Depends(get_object_service)
) -> TrackedObjectDetail:
    return service.get_object(object_id)
