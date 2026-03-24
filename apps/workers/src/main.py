import asyncio
import logging
from collections.abc import Awaitable, Callable
from contextlib import suppress

from src.core.config import get_settings
from src.jobs.alerts import process_alerts
from src.jobs.conjunctions import run_conjunction_detection
from src.jobs.ingestion import run_ingestion
from src.jobs.propagation import run_propagation
from src.jobs.risk import compute_risk
from src.jobs.simulations import run_simulations


async def run_analysis_cycle() -> None:
    await run_propagation()
    await run_conjunction_detection()
    await compute_risk()
    await process_alerts()


async def run_startup_pipeline() -> None:
    await run_ingestion()
    await run_analysis_cycle()


async def run_periodic_job(
    name: str,
    interval_seconds: float,
    operation: Callable[[], Awaitable[None]],
    *,
    run_immediately: bool = False,
) -> None:
    active_run: asyncio.Task[None] | None = None

    async def tick() -> asyncio.Task[None]:
        nonlocal active_run

        if active_run is not None:
            if active_run.done():
                await active_run
            else:
                logging.info("Skipping %s cycle because the previous run is still active", name)
                return active_run

        active_run = asyncio.create_task(operation())
        return active_run

    try:
        if run_immediately:
            await tick()

        while True:
            await asyncio.sleep(interval_seconds)
            await tick()
    finally:
        if active_run is not None:
            if active_run.done():
                await active_run
            else:
                active_run.cancel()
                with suppress(asyncio.CancelledError):
                    await active_run


async def bootstrap() -> None:
    settings = get_settings()
    logging.basicConfig(level=getattr(logging, settings.log_level.upper(), logging.INFO))
    logging.info("Starting SDMPS workers against %s", settings.redis_url)

    await run_startup_pipeline()

    await asyncio.gather(
        run_periodic_job(
            "ingestion",
            settings.tle_poll_interval_minutes * 60,
            run_ingestion,
        ),
        run_periodic_job(
            "analysis",
            5 * 60,
            run_analysis_cycle,
        ),
        run_simulations(),
    )


def main() -> None:
    asyncio.run(bootstrap())


if __name__ == "__main__":
    main()
