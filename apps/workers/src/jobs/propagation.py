import asyncio
import logging

from src.ingestion_backend import refresh_current_states


async def run_propagation() -> None:
    count = await asyncio.to_thread(refresh_current_states)
    logging.info("Propagated %s current states", count)
