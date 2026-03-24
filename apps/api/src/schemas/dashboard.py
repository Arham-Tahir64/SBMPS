from pydantic import BaseModel


class DashboardSummary(BaseModel):
    epoch: str
    trackedObjectCount: int
    highRiskConjunctionCount: int
    criticalRiskConjunctionCount: int
    activeFeedCount: int
    staleFeedCount: int
