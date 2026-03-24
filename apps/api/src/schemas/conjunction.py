from typing import Literal

from pydantic import BaseModel

from src.schemas.object import RiskTier


class ConjunctionEventSummary(BaseModel):
    id: str
    primaryObjectId: str
    primaryObjectName: str
    secondaryObjectId: str
    secondaryObjectName: str
    missDistanceKm: float
    tca: str
    riskTier: RiskTier


class ConjunctionEventDetail(ConjunctionEventSummary):
    relativeVelocityKmPerSecond: float
    pcValue: float | None = None
    methodology: Literal["estimated", "covariance-backed"]
