from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


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
        default="postgresql+psycopg://sdmps:sdmps@localhost:5432/sdmps", alias="DATABASE_URL"
    )
    redis_url: str = Field(default="redis://localhost:6379/0", alias="REDIS_URL")


@lru_cache
def get_settings() -> Settings:
    return Settings()
