FROM python:3.12-slim

WORKDIR /app
COPY apps/workers /app
RUN pip install --no-cache-dir uv
RUN uv sync
CMD ["uv", "run", "python", "-m", "src.main"]
