import asyncio
import logging

from src.ingestion_backend import synthesize_alerts


async def process_alerts() -> None:
    counts = await asyncio.to_thread(synthesize_alerts)
    logging.info(
        "Alert synthesis cycle completed: %d conjunction alert(s), %d feed-stale alert(s)",
        counts["conjunction"],
        counts["feed_stale"],
    )
