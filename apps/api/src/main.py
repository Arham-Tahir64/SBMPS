from contextlib import asynccontextmanager

from fastapi import FastAPI

from src.api.router import api_router
from src.core.config import get_settings
from src.core.logging import configure_logging
from src.db import init_db


settings = get_settings()
configure_logging(settings.log_level)

@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="SDMPS API",
    version="0.1.0",
    description="Space Debris Mapping and Prediction System API scaffold.",
    lifespan=lifespan,
)
app.include_router(api_router)
