from src.schemas.conjunction import ConjunctionEventDetail
from src.schemas.dashboard import DashboardSummary
from src.schemas.live import LiveSnapshot
from src.schemas.object import FeedStatus, TrackedObjectDetail
from src.schemas.operations import OperationsEvent


class SeedStore:
    def __init__(self) -> None:
        self.objects = [
            TrackedObjectDetail(
                id="25544",
                name="ISS",
                noradId=25544,
                objectClass="active-satellite",
                riskTier="low",
                epoch="2026-03-24T00:00:00Z",
                positionKm=[6800.0, 200.0, 50.0],
                velocityKmPerSecond=[7.66, 0.01, 0.02],
                operatorName="NASA",
                source="CelesTrak",
            ),
            TrackedObjectDetail(
                id="40069",
                name="FENGYUN FRAG",
                noradId=40069,
                objectClass="debris-fragment",
                riskTier="high",
                epoch="2026-03-24T00:00:00Z",
                positionKm=[6900.0, -200.0, 120.0],
                velocityKmPerSecond=[7.12, -0.08, 0.12],
                operatorName=None,
                source="CelesTrak",
            ),
            TrackedObjectDetail(
                id="33591",
                name="IRIDIUM DEB",
                noradId=33591,
                objectClass="debris-fragment",
                riskTier="medium",
                epoch="2026-03-24T00:00:00Z",
                positionKm=[6650.0, 250.0, -180.0],
                velocityKmPerSecond=[7.31, 0.05, -0.04],
                operatorName=None,
                source="CelesTrak",
            ),
        ]
        self.conjunctions = [
            ConjunctionEventDetail(
                id="cj-1",
                primaryObjectId="25544",
                primaryObjectName="ISS",
                secondaryObjectId="40069",
                secondaryObjectName="FENGYUN FRAG",
                missDistanceKm=3.42,
                tca="2026-03-24T12:15:00Z",
                riskTier="high",
                relativeVelocityKmPerSecond=12.3,
                pcValue=None,
                methodology="estimated",
            )
        ]
        self.feeds = [
            FeedStatus(
                source="CelesTrak",
                lastIngestedAt="2026-03-24T00:00:00Z",
                staleThresholdMinutes=240,
                isStale=False,
            ),
            FeedStatus(
                source="Space-Track",
                lastIngestedAt="2026-03-23T18:45:00Z",
                staleThresholdMinutes=240,
                isStale=True,
            ),
        ]
        self.events = [
            OperationsEvent(
                eventId="ops-1",
                kind="feed-status",
                severity="medium",
                message="Space-Track feed is stale beyond threshold.",
                createdAt="2026-03-24T00:10:00Z",
            ),
            OperationsEvent(
                eventId="ops-2",
                kind="conjunction",
                severity="high",
                message="ISS conjunction watchlist contains one high-risk event.",
                createdAt="2026-03-24T00:12:00Z",
            ),
        ]
        self.epoch = "2026-03-24T00:00:00Z"

    def snapshot(self) -> LiveSnapshot:
        return LiveSnapshot(
            epoch=self.epoch,
            objects=[item.to_summary() for item in self.objects],
            conjunctions=[item.to_summary() for item in self.conjunctions],
            feeds=self.feeds,
        )

    def dashboard_summary(self) -> DashboardSummary:
        return DashboardSummary(
            epoch=self.epoch,
            trackedObjectCount=len(self.objects),
            highRiskConjunctionCount=sum(1 for item in self.conjunctions if item.riskTier == "high"),
            criticalRiskConjunctionCount=sum(1 for item in self.conjunctions if item.riskTier == "critical"),
            activeFeedCount=sum(1 for item in self.feeds if not item.isStale),
            staleFeedCount=sum(1 for item in self.feeds if item.isStale),
        )


store = SeedStore()
