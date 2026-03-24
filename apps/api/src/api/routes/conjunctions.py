from fastapi import APIRouter, Depends

from src.api.dependencies import get_conjunction_service
from src.schemas.conjunction import ConjunctionEventDetail, ConjunctionEventSummary
from src.services.conjunctions import ConjunctionService


router = APIRouter()


@router.get("", response_model=list[ConjunctionEventSummary])
def list_conjunctions(
    service: ConjunctionService = Depends(get_conjunction_service),
) -> list[ConjunctionEventSummary]:
    return service.list_conjunctions()


@router.get("/{conjunction_id}", response_model=ConjunctionEventDetail)
def get_conjunction(
    conjunction_id: str, service: ConjunctionService = Depends(get_conjunction_service)
) -> ConjunctionEventDetail:
    return service.get_conjunction(conjunction_id)
