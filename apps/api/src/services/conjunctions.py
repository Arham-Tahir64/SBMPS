from fastapi import HTTPException

from src.persisted_state import get_conjunction, list_conjunctions
from src.schemas.conjunction import ConjunctionEventDetail, ConjunctionEventSummary


class ConjunctionService:
    def list_conjunctions(self) -> list[ConjunctionEventSummary]:
        return list_conjunctions()

    def get_conjunction(self, conjunction_id: str) -> ConjunctionEventDetail:
        conjunction = get_conjunction(conjunction_id)
        if conjunction is not None:
            return conjunction
        raise HTTPException(status_code=404, detail=f"Conjunction {conjunction_id} not found")
