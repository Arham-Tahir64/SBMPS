from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from src.api.dependencies import get_simulation_service
from src.schemas.simulation import SimulationJobSummary
from src.services.simulations import SimulationService


class CreateSimulationRequest(BaseModel):
    scenarioName: str
    durationDays: int = Field(default=7, ge=1, le=30)
    objectSampleSize: int = Field(default=500, ge=50, le=2000)
    stepHours: int = Field(default=6, ge=1, le=24)


router = APIRouter()


@router.get("", response_model=list[SimulationJobSummary])
def list_simulations(
    service: SimulationService = Depends(get_simulation_service),
) -> list[SimulationJobSummary]:
    return service.list_jobs()


@router.post("", response_model=SimulationJobSummary, status_code=201)
def create_simulation(
    payload: CreateSimulationRequest,
    service: SimulationService = Depends(get_simulation_service),
) -> SimulationJobSummary:
    return service.create_job(
        scenario_name=payload.scenarioName,
        duration_days=payload.durationDays,
        object_sample_size=payload.objectSampleSize,
        step_hours=payload.stepHours,
    )


@router.get("/{simulation_id}", response_model=SimulationJobSummary)
def get_simulation(
    simulation_id: str,
    service: SimulationService = Depends(get_simulation_service),
) -> SimulationJobSummary:
    job = service.get_job(simulation_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Simulation not found")
    return job
