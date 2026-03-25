from typing import Literal

from pydantic import BaseModel


class SimulationJobSummary(BaseModel):
    id: str
    scenarioName: str
    status: Literal["queued", "running", "completed", "failed"]
    durationDays: int
    objectSampleSize: int
    stepHours: int
    createdAt: str
    startedAt: str | None = None
    completedAt: str | None = None
    errorMessage: str | None = None
    conjunctionsDetected: int | None = None
    criticalCount: int | None = None
    highCount: int | None = None
    objectsAnalyzed: int | None = None
