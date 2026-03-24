from typing import Literal

from pydantic import BaseModel


RiskTier = Literal["low", "medium", "high", "critical"]
ObjectClass = Literal["active-satellite", "rocket-body", "debris-fragment"]


class TrackedObjectSummary(BaseModel):
    id: str
    name: str
    noradId: int
    objectClass: ObjectClass
    riskTier: RiskTier
    epoch: str
    positionKm: list[float]


class TrackedObjectDetail(TrackedObjectSummary):
    velocityKmPerSecond: list[float]
    operatorName: str | None = None
    source: str

    def to_summary(self) -> TrackedObjectSummary:
        return TrackedObjectSummary(
            id=self.id,
            name=self.name,
            noradId=self.noradId,
            objectClass=self.objectClass,
            riskTier=self.riskTier,
            epoch=self.epoch,
            positionKm=self.positionKm,
        )


class FeedStatus(BaseModel):
    source: str
    lastIngestedAt: str
    staleThresholdMinutes: int
    isStale: bool
