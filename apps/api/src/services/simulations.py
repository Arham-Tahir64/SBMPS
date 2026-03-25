from __future__ import annotations

import uuid
from datetime import UTC, datetime

from sqlalchemy import select

from sdmps_data import SimulationJob, session_scope
from src.core.config import get_settings
from src.schemas.simulation import SimulationJobSummary


def _to_summary(job: SimulationJob) -> SimulationJobSummary:
    return SimulationJobSummary(
        id=job.id,
        scenarioName=job.scenario_name,
        status=job.status,
        durationDays=job.duration_days,
        objectSampleSize=job.object_sample_size,
        stepHours=job.step_hours,
        createdAt=job.created_at.isoformat(),
        startedAt=job.started_at.isoformat() if job.started_at else None,
        completedAt=job.completed_at.isoformat() if job.completed_at else None,
        errorMessage=job.error_message,
        conjunctionsDetected=job.conjunctions_detected,
        criticalCount=job.critical_count,
        highCount=job.high_count,
        objectsAnalyzed=job.objects_analyzed,
    )


class SimulationService:
    def list_jobs(self) -> list[SimulationJobSummary]:
        settings = get_settings()
        with session_scope(settings.database_url) as session:
            jobs = session.scalars(
                select(SimulationJob).order_by(SimulationJob.created_at.desc())
            ).all()
        return [_to_summary(j) for j in jobs]

    def create_job(
        self,
        scenario_name: str,
        duration_days: int = 7,
        object_sample_size: int = 500,
        step_hours: int = 6,
    ) -> SimulationJobSummary:
        settings = get_settings()
        job = SimulationJob(
            id=str(uuid.uuid4()),
            scenario_name=scenario_name,
            status="queued",
            duration_days=max(1, min(duration_days, 30)),
            object_sample_size=max(50, min(object_sample_size, 2000)),
            step_hours=max(1, min(step_hours, 24)),
            created_at=datetime.now(UTC),
        )
        with session_scope(settings.database_url) as session:
            session.add(job)
        return _to_summary(job)

    def get_job(self, job_id: str) -> SimulationJobSummary | None:
        settings = get_settings()
        with session_scope(settings.database_url) as session:
            job = session.get(SimulationJob, job_id)
        if job is None:
            return None
        return _to_summary(job)
