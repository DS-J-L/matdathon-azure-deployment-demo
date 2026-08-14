from functools import lru_cache
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_env: Literal["development", "test", "production"] = "development"
    cors_allowed_origins: str = "http://localhost:5173"
    cosmos_endpoint: str | None = None
    cosmos_database_name: str = "scheduler"
    cosmos_container_name: str = "schedules"
    applicationinsights_connection_string: str | None = None
    key_vault_uri: str | None = Field(default=None, validation_alias="KEY_VAULT_URI")

    @property
    def allowed_origins(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.cors_allowed_origins.split(",")
            if origin.strip()
        ]


@lru_cache
def get_settings() -> Settings:
    return Settings()
