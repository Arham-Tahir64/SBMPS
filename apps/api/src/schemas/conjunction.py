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

    def to_summary(self) -> ConjunctionEventSummary:
        return ConjunctionEventSummary(
            id=self.id,
            primaryObjectId=self.primaryObjectId,
            primaryObjectName=self.primaryObjectName,
            secondaryObjectId=self.secondaryObjectId,
            secondaryObjectName=self.secondaryObjectName,
            missDistanceKm=self.missDistanceKm,
            tca=self.tca,
            riskTier=self.riskTier,
        )
