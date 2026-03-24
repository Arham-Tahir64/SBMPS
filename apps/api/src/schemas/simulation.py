from typing import Literal

from pydantic import BaseModel


class SimulationJobSummary(BaseModel):
    id: str
    scenarioName: str
    status: Literal["queued", "running", "completed", "failed"]
    createdAt: str
