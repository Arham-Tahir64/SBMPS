from pathlib import Path
from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


REPO_ROOT = Path(__file__).resolve().parents[4]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    redis_url: str = Field(default="redis://localhost:6379/0", alias="REDIS_URL")
    log_level: str = Field(default="INFO", alias="API_LOG_LEVEL")
    tle_poll_interval_minutes: int = Field(default=60, alias="TLE_POLL_INTERVAL_MINUTES")
    local_database_path: str = Field(
        default=str(REPO_ROOT / "sdmps.sqlite3"), alias="LOCAL_DATABASE_PATH"
    )
    celestrak_active_feed_url: str = Field(
        default="https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle",
        alias="CELESTRAK_ACTIVE_FEED_URL",
    )
    feed_request_timeout_seconds: int = Field(default=30, alias="FEED_REQUEST_TIMEOUT_SECONDS")
    tle_stale_threshold_minutes: int = Field(default=240, alias="TLE_STALE_THRESHOLD_MINUTES")


@lru_cache
def get_settings() -> Settings:
    return Settings()
