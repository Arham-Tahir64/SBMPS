from fastapi import HTTPException

from src.schemas.conjunction import ConjunctionEventDetail, ConjunctionEventSummary


class ConjunctionService:
    def list_conjunctions(self) -> list[ConjunctionEventSummary]:
        return []

    def get_conjunction(self, conjunction_id: str) -> ConjunctionEventDetail:
        raise HTTPException(status_code=404, detail=f"Conjunction {conjunction_id} not found")
