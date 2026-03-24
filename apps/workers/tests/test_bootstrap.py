from unittest.mock import AsyncMock, patch

from src import main


def test_bootstrap_schedules_all_jobs() -> None:
    with patch.object(main, "run_ingestion", AsyncMock()) as ingestion, patch.object(
        main, "run_propagation", AsyncMock()
    ) as propagation, patch.object(main, "run_conjunction_detection", AsyncMock()) as conjunctions, patch.object(
        main, "compute_risk", AsyncMock()
    ) as risk, patch.object(main, "process_alerts", AsyncMock()) as alerts, patch.object(
        main, "run_simulations", AsyncMock()
    ) as simulations:
        main.asyncio.run(main.bootstrap())

    ingestion.assert_awaited_once()
    propagation.assert_awaited_once()
    conjunctions.assert_awaited_once()
    risk.assert_awaited_once()
    alerts.assert_awaited_once()
    simulations.assert_awaited_once()
