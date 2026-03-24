import asyncio
import logging

from src.core.config import get_settings
from src.jobs.alerts import process_alerts
from src.jobs.conjunctions import run_conjunction_detection
from src.jobs.ingestion import run_ingestion
from src.jobs.propagation import run_propagation
from src.jobs.risk import compute_risk
from src.jobs.simulations import run_simulations


async def bootstrap() -> None:
    settings = get_settings()
    logging.basicConfig(level=getattr(logging, settings.log_level.upper(), logging.INFO))
    logging.info("Starting SDMPS workers against %s", settings.redis_url)
    await asyncio.gather(
        run_ingestion(),
        run_propagation(),
        run_conjunction_detection(),
        compute_risk(),
        process_alerts(),
        run_simulations(),
    )


def main() -> None:
    asyncio.run(bootstrap())


if __name__ == "__main__":
    main()
