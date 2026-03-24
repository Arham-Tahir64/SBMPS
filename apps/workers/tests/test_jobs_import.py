from src.jobs.alerts import process_alerts
from src.jobs.conjunctions import run_conjunction_detection
from src.jobs.ingestion import run_ingestion
from src.jobs.propagation import run_propagation
from src.jobs.risk import compute_risk
from src.jobs.simulations import run_simulations


def test_jobs_are_callable() -> None:
    assert callable(run_ingestion)
    assert callable(run_propagation)
    assert callable(run_conjunction_detection)
    assert callable(compute_risk)
    assert callable(process_alerts)
    assert callable(run_simulations)
