from fastapi import HTTPException

from src.data.store import SeedStore
from src.schemas.object import TrackedObjectDetail, TrackedObjectSummary


class ObjectService:
    def __init__(self, store: SeedStore):
        self.store = store

    def list_objects(self) -> list[TrackedObjectSummary]:
        return [item.to_summary() for item in self.store.objects]

    def get_object(self, object_id: str) -> TrackedObjectDetail:
        for item in self.store.objects:
            if item.id == object_id:
                return item
        raise HTTPException(status_code=404, detail=f"Object {object_id} not found")
