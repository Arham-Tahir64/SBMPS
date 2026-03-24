# SDMPS

Space Debris Mapping and Prediction System monorepo scaffold.

## Workspace Layout
- `apps/web`: Next.js operator console
- `apps/api`: FastAPI REST and SSE API
- `apps/workers`: Python worker service
- `packages/*`: shared TypeScript and Python packages
- `infra/*`: local infrastructure and observability assets
- `docs/*`: implementation and product documents

## Prerequisites
- Node.js 20+
- `pnpm`
- Python 3.12+
- `uv`
- Docker Desktop or compatible Docker runtime

## Local Startup
1. Copy `.env.example` into your preferred local env files.
2. Start infrastructure:
   - `docker compose -f docker-compose.dev.yml up -d`
3. Install JavaScript dependencies:
   - `pnpm install`
4. Install Python dependencies:
   - `uv sync --project apps/api`
   - `uv sync --project apps/workers`
5. Start the services:
   - Web: `pnpm --filter web dev`
   - API: `uv run --project apps/api uvicorn src.main:app --reload`
   - Workers: `uv run --project apps/workers python -m src.main`

## Notes
- The web app currently uses placeholder-backed UI flows and route skeletons.
- The API exposes typed placeholder payloads that match the shared frontend contracts.
- Worker jobs are wired as stubs for ingestion, propagation, conjunction detection, risk, alerting, and simulations.
