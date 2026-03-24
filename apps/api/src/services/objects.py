from fastapi import HTTPException

from src.persisted_state import get_persisted_object, list_persisted_objects
from src.schemas.object import TrackedObjectDetail, TrackedObjectSummary


class ObjectService:
    def list_objects(self) -> list[TrackedObjectSummary]:
        return [item.to_summary() for item in list_persisted_objects()]

    def get_object(self, object_id: str) -> TrackedObjectDetail:
        item = get_persisted_object(object_id)
        if item is not None:
            return item
        raise HTTPException(status_code=404, detail=f"Object {object_id} not found")
