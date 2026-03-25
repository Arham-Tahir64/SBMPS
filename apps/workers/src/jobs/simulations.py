from __future__ import annotations

import asyncio
import logging
from datetime import UTC, datetime, timedelta
from math import sqrt

from sdmps_data import SimulationJob, TleSnapshot, session_scope
from sqlalchemy import func, select

from src.core.config import get_settings


def _run_simulation_sync(job_id: str, database_url: str) -> dict[str, int]:
    """
    Core simulation logic (runs in a thread to avoid blocking the event loop).

    Algorithm:
      1. Fetch the latest TLE snapshot for each of the first `object_sample_size`
         objects (ordered by object_id for determinism).
      2. Parse each TLE with sgp4 Satrec.
      3. Step forward from now by `step_hours` increments for `duration_days` days.
      4. At each timestep propagate all satellites and run a KDTree conjunction scan
         with a 25 km candidate radius and 5 km persist threshold.
      5. Count total, critical (< 1 km) and high-risk (< 5 km) conjunction pairs.
    """
    try:
        from sgp4.api import Satrec, jday  # type: ignore[import]
        from scipy.spatial import KDTree  # type: ignore[import]
    except ModuleNotFoundError as exc:
        raise RuntimeError(f"Missing dependency: {exc}") from exc

    settings_obj = __import__("src.core.config", fromlist=["get_settings"]).get_settings()

    with session_scope(database_url) as session:
        job = session.get(SimulationJob, job_id)
        if job is None:
            raise ValueError(f"Job {job_id} not found")
        duration_days = job.duration_days
        step_hours = job.step_hours
        sample_size = job.object_sample_size

        # Fetch the most-recently ingested TLE for each object (up to sample_size).
        latest_ingest = (
            select(TleSnapshot.object_id, func.max(TleSnapshot.ingested_at).label("lat"))
            .group_by(TleSnapshot.object_id)
            .subquery()
        )
        rows = session.execute(
            select(TleSnapshot)
            .join(
                latest_ingest,
                (latest_ingest.c.object_id == TleSnapshot.object_id)
                & (latest_ingest.c.lat == TleSnapshot.ingested_at),
            )
            .order_by(TleSnapshot.object_id.asc())
            .limit(sample_size)
        ).scalars().all()

        tles = [(r.line1, r.line2) for r in rows]

    if len(tles) < 2:
        return {"conjunctions_detected": 0, "critical_count": 0, "high_count": 0, "objects_analyzed": len(tles)}

    satellites = []
    valid_indices: list[int] = []
    for i, (l1, l2) in enumerate(tles):
        try:
            sat = Satrec.twoline2rv(l1, l2)
            satellites.append(sat)
            valid_indices.append(i)
        except Exception:
            pass

    total_conjunctions = 0
    critical_count = 0
    high_count = 0

    now = datetime.now(UTC)
    total_steps = (duration_days * 24) // step_hours

    for step in range(total_steps):
        t = now + timedelta(hours=step * step_hours)
        jd, fr = jday(t.year, t.month, t.day, t.hour, t.minute,
                      t.second + t.microsecond / 1_000_000)

        positions: list[list[float]] = []
        active: list[int] = []
        for idx, sat in enumerate(satellites):
            err, pos, _ = sat.sgp4(jd, fr)
            if err == 0:
                positions.append([float(pos[0]), float(pos[1]), float(pos[2])])
                active.append(idx)

        if len(positions) < 2:
            continue

        tree = KDTree(positions)
        pairs = tree.query_pairs(r=25.0)  # candidate radius km

        for i, j in pairs:
            px, py, pz = positions[i]
            qx, qy, qz = positions[j]
            dx, dy, dz = px - qx, py - qy, pz - qz
            dist = sqrt(dx * dx + dy * dy + dz * dz)
            if dist <= 5.0:
                total_conjunctions += 1
                if dist < 1.0:
                    critical_count += 1
                elif dist < 5.0:
                    high_count += 1

    logging.info(
        "Simulation %s complete: %d steps, %d objects, %d conjunctions (%d critical, %d high)",
        job_id, total_steps, len(satellites), total_conjunctions, critical_count, high_count,
    )
    return {
        "conjunctions_detected": total_conjunctions,
        "critical_count": critical_count,
        "high_count": high_count,
        "objects_analyzed": len(satellites),
    }


async def run_simulations() -> None:
    """Pick up one queued simulation job per worker cycle and execute it."""
    settings = get_settings()

    with session_scope(settings.database_url) as session:
        job = session.scalar(
            select(SimulationJob)
            .where(SimulationJob.status == "queued")
            .order_by(SimulationJob.created_at.asc())
            .limit(1)
        )
        if job is None:
            return

        job_id = job.id
        job.status = "running"
        job.started_at = datetime.now(UTC)

    logging.info("Starting simulation job %s", job_id)

    try:
        result = await asyncio.to_thread(_run_simulation_sync, job_id, settings.database_url)
    except Exception as exc:
        logging.exception("Simulation job %s failed: %s", job_id, exc)
        with session_scope(settings.database_url) as session:
            j = session.get(SimulationJob, job_id)
            if j:
                j.status = "failed"
                j.completed_at = datetime.now(UTC)
                j.error_message = str(exc)[:500]
        return

    with session_scope(settings.database_url) as session:
        j = session.get(SimulationJob, job_id)
        if j:
            j.status = "completed"
            j.completed_at = datetime.now(UTC)
            j.conjunctions_detected = result["conjunctions_detected"]
            j.critical_count = result["critical_count"]
            j.high_count = result["high_count"]
            j.objects_analyzed = result["objects_analyzed"]

    logging.info("Simulation job %s completed successfully", job_id)
