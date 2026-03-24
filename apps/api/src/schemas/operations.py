from typing import Literal

from pydantic import BaseModel

from src.schemas.object import RiskTier


class OperationsEvent(BaseModel):
    eventId: str
    kind: Literal["feed-status", "conjunction", "simulation"]
    severity: RiskTier
    message: str
    createdAt: str
