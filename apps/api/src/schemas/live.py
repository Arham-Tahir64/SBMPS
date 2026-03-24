from pydantic import BaseModel

from src.schemas.conjunction import ConjunctionEventSummary
from src.schemas.object import FeedStatus, TrackedObjectSummary


class LiveSnapshot(BaseModel):
    epoch: str
    objects: list[TrackedObjectSummary]
    conjunctions: list[ConjunctionEventSummary]
    feeds: list[FeedStatus]
