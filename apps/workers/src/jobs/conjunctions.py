import asyncio
import logging

from src.ingestion_backend import refresh_conjunction_events


async def run_conjunction_detection() -> None:
    count = await asyncio.to_thread(refresh_conjunction_events)
    logging.info("Persisted %s conjunction events", count)
