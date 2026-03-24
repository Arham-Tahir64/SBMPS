from dataclasses import dataclass


@dataclass
class QueueConfig:
    redis_url: str
    queue_name: str = "sdmps-default"


class RedisQueue:
    def __init__(self, config: QueueConfig):
        self.config = config

    async def publish(self, payload: dict) -> None:
        # Placeholder for Redis-backed queue wiring.
        _ = payload
