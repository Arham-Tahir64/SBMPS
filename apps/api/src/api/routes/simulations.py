from fastapi import APIRouter
from pydantic import BaseModel

from src.schemas.simulation import SimulationJobSummary


class CreateSimulationRequest(BaseModel):
    scenarioName: str


router = APIRouter()


@router.get("", response_model=list[SimulationJobSummary])
def list_simulations() -> list[SimulationJobSummary]:
    return [
        SimulationJobSummary(
            id="sim-1",
            scenarioName="LEO ten-year baseline",
            status="queued",
            createdAt="2026-03-24T01:00:00Z",
        )
    ]


@router.post("", response_model=SimulationJobSummary)
def create_simulation(payload: CreateSimulationRequest) -> SimulationJobSummary:
    return SimulationJobSummary(
        id="sim-new",
        scenarioName=payload.scenarioName,
        status="queued",
        createdAt="2026-03-24T01:10:00Z",
    )


@router.get("/{simulation_id}", response_model=SimulationJobSummary)
def get_simulation(simulation_id: str) -> SimulationJobSummary:
    return SimulationJobSummary(
        id=simulation_id,
        scenarioName="LEO ten-year baseline",
        status="queued",
        createdAt="2026-03-24T01:00:00Z",
    )
