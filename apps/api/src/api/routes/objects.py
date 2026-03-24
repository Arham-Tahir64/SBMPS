from fastapi import APIRouter, Depends

from src.api.dependencies import get_object_service
from src.schemas.object import TrackedObjectDetail, TrackedObjectSummary
from src.services.objects import ObjectService


router = APIRouter()


@router.get("", response_model=list[TrackedObjectSummary])
def list_objects(service: ObjectService = Depends(get_object_service)) -> list[TrackedObjectSummary]:
    return service.list_objects()


@router.get("/{object_id}", response_model=TrackedObjectDetail)
def get_object(
    object_id: str, service: ObjectService = Depends(get_object_service)
) -> TrackedObjectDetail:
    return service.get_object(object_id)
