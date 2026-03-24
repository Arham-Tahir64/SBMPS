import asyncio
import logging

from src.ingestion_backend import ingest_celestrak_feed


async def run_ingestion() -> None:
    count = await asyncio.to_thread(ingest_celestrak_feed)
    logging.info("Ingested %s objects from CelesTrak", count)
