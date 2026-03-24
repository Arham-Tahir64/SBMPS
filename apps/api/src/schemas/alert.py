from pydantic import BaseModel


class AlertEvent(BaseModel):
    id: str
    kind: str
    severity: str
    message: str
    createdAt: str
