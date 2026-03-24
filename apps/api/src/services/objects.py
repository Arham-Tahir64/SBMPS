from fastapi import HTTPException

from src.persisted_state import get_object_trajectory, get_persisted_object, list_persisted_objects
from src.schemas.object import ObjectTrajectory, TrackedObjectDetail, TrackedObjectSummary


class ObjectService:
    def list_objects(self) -> list[TrackedObjectSummary]:
        return [item.to_summary() for item in list_persisted_objects()]

    def get_object(self, object_id: str) -> TrackedObjectDetail:
        item = get_persisted_object(object_id)
        if item is not None:
            return item
        raise HTTPException(status_code=404, detail=f"Object {object_id} not found")

    def get_trajectory(self, object_id: str, minutes: int) -> ObjectTrajectory:
        result = get_object_trajectory(object_id, minutes=minutes)
        if result is not None:
            return result
        raise HTTPException(
            status_code=404,
            detail=f"Object {object_id} not found or no TLE data available for propagation",
        )
