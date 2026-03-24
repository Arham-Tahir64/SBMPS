import asyncio
from unittest.mock import AsyncMock, patch

from src import main


def test_run_analysis_cycle_executes_jobs_in_order() -> None:
    calls: list[str] = []

    async def mark(label: str) -> None:
        calls.append(label)

    async def propagation() -> None:
        await mark("propagation")

    async def conjunctions() -> None:
        await mark("conjunctions")

    async def risk() -> None:
        await mark("risk")

    async def alerts() -> None:
        await mark("alerts")

    with patch.object(main, "run_propagation", AsyncMock(side_effect=propagation)), patch.object(
        main, "run_conjunction_detection", AsyncMock(side_effect=conjunctions)
    ), patch.object(main, "compute_risk", AsyncMock(side_effect=risk)), patch.object(
        main, "process_alerts", AsyncMock(side_effect=alerts)
    ):
        asyncio.run(main.run_analysis_cycle())

    assert calls == ["propagation", "conjunctions", "risk", "alerts"]


def test_run_startup_pipeline_executes_ingestion_then_analysis() -> None:
    calls: list[str] = []

    async def mark(label: str) -> None:
        calls.append(label)

    async def ingestion() -> None:
        await mark("ingestion")

    async def analysis() -> None:
        await mark("analysis")

    with patch.object(main, "run_ingestion", AsyncMock(side_effect=ingestion)), patch.object(
        main, "run_analysis_cycle", AsyncMock(side_effect=analysis)
    ):
        asyncio.run(main.run_startup_pipeline())

    assert calls == ["ingestion", "analysis"]


def test_bootstrap_starts_scheduler_after_startup_pipeline() -> None:
    with patch.object(main, "run_startup_pipeline", AsyncMock()) as startup, patch.object(
        main, "run_periodic_job", AsyncMock()
    ) as periodic, patch.object(main, "run_simulations", AsyncMock()) as simulations:
        asyncio.run(main.bootstrap())

    startup.assert_awaited_once()
    assert periodic.await_count == 2
    simulations.assert_awaited_once()
