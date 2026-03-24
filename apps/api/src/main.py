from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sdmps_data import init_database

from src.api.router import api_router
from src.core.config import get_settings
from src.core.logging import configure_logging


configure_logging(get_settings().log_level)


@asynccontextmanager
async def lifespan(_: FastAPI):
    settings = get_settings()
    init_database(settings.database_url)
    yield


app = FastAPI(
    title="SDMPS API",
    version="0.1.0",
    description="Space Debris Mapping and Prediction System API scaffold.",
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(api_router)
