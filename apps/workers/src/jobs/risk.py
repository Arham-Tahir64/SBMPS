import asyncio
import logging

from src.ingestion_backend import refresh_risk_assessments


async def compute_risk() -> None:
    count = await asyncio.to_thread(refresh_risk_assessments)
    logging.info("Persisted %s risk assessments", count)
