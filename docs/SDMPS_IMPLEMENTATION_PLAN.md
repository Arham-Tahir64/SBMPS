# SDMPS Implementation Plan

## Summary
SDMPS will be implemented as a modular monorepo with a web operator console, a Python API, and Python worker services. The v1 scope is web-only and production-oriented, with Unity deferred. The system is Python-first on the backend for astrodynamics fit, CPU-first for initial deployment, and uses managed OIDC with RBAC from the start.

## Repository Structure
- `apps/web`: Next.js operator console
- `apps/api`: FastAPI REST and SSE API
- `apps/workers`: background ingestion, propagation, conjunction, risk, alerting, and simulation jobs
- `packages/domain`: shared TypeScript types and domain helpers
- `packages/api-client`: typed frontend API client and endpoint modules
- `packages/scene`: Three.js and React Three Fiber scene abstractions
- `packages/ui`: reusable UI primitives
- `packages/config`: shared JS and TS config artifacts
- `packages/data`: shared Python database package
- `packages/integrations`: shared Python integration adapters
- `packages/sim`: shared Python simulation interfaces
- `infra`: docker, environment, and observability assets
- `docs`: product and implementation documentation

## Delivery Phases
### Alpha
- Stand up the monorepo and workspace tooling.
- Implement CelesTrak ingestion, TLE parsing, propagation, KD-tree candidate generation, and conjunction persistence.
- Deliver `/operations/live`, `/objects`, and `/conjunctions` with placeholder-backed UI flows.

### Beta
- Add risk assessment, alerting, feed freshness monitoring, heatmap aggregates, SSE live updates, and frontend performance tuning.
- Add RBAC surfaces and operational observability.

### v1.0 GA
- Harden retries, audit logs, stale-feed handling, API docs, runbooks, auth/session reliability, and operator workflows.

### v1.5
- Add long-term simulation, breakup and cascade modeling, exports, and maneuver advisory features behind role and feature gates.

## Technical Defaults
- Frontend: Next.js, TypeScript, TanStack Query, Zustand, Three.js, React Three Fiber
- Backend: FastAPI, Pydantic, SQLAlchemy, Alembic, Redis, PostgreSQL/TimescaleDB, python-sgp4
- Auth: managed OIDC with RBAC
- Transport: REST plus SSE
- Storage: PostgreSQL and TimescaleDB for operational and time-series data, object storage for large exports

## Key API Contracts
- `GET /v1/live/snapshot`
- `GET /v1/objects`
- `GET /v1/objects/{id}`
- `GET /v1/objects/{id}/trajectory`
- `GET /v1/conjunctions`
- `GET /v1/conjunctions/{id}`
- `GET /v1/heatmaps/altitude`
- `GET /v1/feeds/status`
- `GET /v1/dashboard/summary`
- `GET /v1/events/stream`
- `POST /v1/simulations`
- `GET /v1/simulations`
- `GET /v1/simulations/{id}`
- `GET /v1/simulations/{id}/results`
- `GET /v1/conjunctions/{id}/maneuvers`

## Notes
- `Pc` is only authoritative when covariance-backed data exists.
- CelesTrak is the default feed in v1. Space-Track is additive once access and licensing are cleared.
- Rust and GPU acceleration are reserved for measured performance bottlenecks.
