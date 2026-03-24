from fastapi import HTTPException

from src.data.store import SeedStore
from src.schemas.conjunction import ConjunctionEventDetail, ConjunctionEventSummary


class ConjunctionService:
    def __init__(self, store: SeedStore):
        self.store = store

    def list_conjunctions(self) -> list[ConjunctionEventSummary]:
        return [item.to_summary() for item in self.store.conjunctions]

    def get_conjunction(self, conjunction_id: str) -> ConjunctionEventDetail:
        for item in self.store.conjunctions:
            if item.id == conjunction_id:
                return item
        raise HTTPException(status_code=404, detail=f"Conjunction {conjunction_id} not found")
