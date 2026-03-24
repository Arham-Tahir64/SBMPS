from src.persisted_state import list_operations_events
from src.schemas.operations import OperationsEvent


class OperationsService:
    def list_events(self) -> list[OperationsEvent]:
        return list_operations_events()
