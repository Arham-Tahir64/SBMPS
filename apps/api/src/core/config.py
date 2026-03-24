from pathlib import Path
from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


REPO_ROOT = Path(__file__).resolve().parents[4]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    api_host: str = Field(default="0.0.0.0", alias="API_HOST")
    api_port: int = Field(default=8000, alias="API_PORT")
    api_base_url: str = Field(default="http://localhost:8000", alias="API_BASE_URL")
    log_level: str = Field(default="INFO", alias="API_LOG_LEVEL")
    secret_key: str = Field(default="replace-me", alias="API_SECRET_KEY")
    allowed_origins: str = Field(default="http://localhost:3000", alias="API_ALLOWED_ORIGINS")
    oidc_issuer: str = Field(default="https://example.auth0.com/", alias="OIDC_ISSUER")
    oidc_audience: str = Field(default="sdmps-api", alias="OIDC_AUDIENCE")
    database_url: str = Field(
        default=f"sqlite:///{(REPO_ROOT / 'sdmps.sqlite3').as_posix()}", alias="DATABASE_URL"
    )
    local_database_path: str = Field(
        default=str(REPO_ROOT / "sdmps.sqlite3"), alias="LOCAL_DATABASE_PATH"
    )
    redis_url: str = Field(default="redis://localhost:6379/0", alias="REDIS_URL")
    celestrak_active_feed_url: str = Field(
        default="https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle",
        alias="CELESTRAK_ACTIVE_FEED_URL",
    )
    feed_request_timeout_seconds: int = Field(default=30, alias="FEED_REQUEST_TIMEOUT_SECONDS")
    tle_stale_threshold_minutes: int = Field(default=240, alias="TLE_STALE_THRESHOLD_MINUTES")


@lru_cache
def get_settings() -> Settings:
    return Settings()
