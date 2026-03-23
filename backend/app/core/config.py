import json
from functools import lru_cache
from typing import Annotated

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


def normalize_database_url(value: str) -> str:
    normalized = value.strip()

    if normalized.startswith("postgres://"):
        return normalized.replace("postgres://", "postgresql+asyncpg://", 1)

    if normalized.startswith("postgresql://"):
        return normalized.replace("postgresql://", "postgresql+asyncpg://", 1)

    return normalized


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = Field(alias="DATABASE_URL")
    cors_origins: Annotated[list[str], NoDecode] = Field(
        default_factory=lambda: ["http://localhost:5173"],
        alias="CORS_ORIGINS",
    )
    clerk_secret_key: str | None = Field(
        default=None, alias="CLERK_SECRET_KEY")
    clerk_jwks_url: str | None = Field(default=None, alias="CLERK_JWKS_URL")
    clerk_api_url: str = Field(
        default="https://api.clerk.com/v1",
        alias="CLERK_API_URL",
    )
    clerk_issuer: str | None = Field(default=None, alias="CLERK_ISSUER")
    clerk_webhook_secret: str | None = Field(
        default=None,
        alias="CLERK_WEBHOOK_SECRET",
    )
    clerk_authorized_parties: Annotated[list[str], NoDecode] = Field(
        default_factory=list,
        alias="CLERK_AUTHORIZED_PARTIES",
    )

    @field_validator("database_url", mode="before")
    @classmethod
    def normalize_database_url_value(cls, value: str):
        return normalize_database_url(value)

    @field_validator("cors_origins", "clerk_authorized_parties", mode="before")
    @classmethod
    def parse_string_list(cls, value: str | list[str] | None):
        if value is None or value == "":
            return []

        if isinstance(value, list):
            return value

        normalized = value.strip()
        if normalized.startswith("["):
            return json.loads(normalized)

        return [item.strip() for item in normalized.split(",") if item.strip()]

    @property
    def clerk_jwt_ready(self) -> bool:
        return bool(self.clerk_jwks_url)

    @property
    def clerk_api_ready(self) -> bool:
        return bool(self.clerk_secret_key)


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
