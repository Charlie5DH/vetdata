import json
from functools import lru_cache
from typing import Annotated
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


def normalize_database_url(value: str) -> str:
    normalized = value.strip()

    if normalized.startswith("postgres://"):
        normalized = normalized.replace(
            "postgres://", "postgresql+asyncpg://", 1)

    elif normalized.startswith("postgresql://"):
        normalized = normalized.replace(
            "postgresql://", "postgresql+asyncpg://", 1)

    split_url = urlsplit(normalized)
    query_params = parse_qsl(split_url.query, keep_blank_values=True)

    rewritten_query_params: list[tuple[str, str]] = []
    for key, query_value in query_params:
        if key != "sslmode":
            rewritten_query_params.append((key, query_value))
            continue

        if query_value.lower() in {"require", "prefer", "allow"}:
            rewritten_query_params.append(("ssl", "require"))
        elif query_value.lower() in {"disable", "false", "0"}:
            rewritten_query_params.append(("ssl", "false"))
        else:
            rewritten_query_params.append(("ssl", query_value))

    return urlunsplit(split_url._replace(query=urlencode(rewritten_query_params)))


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = Field(alias="DATABASE_URL")
    cors_origins: Annotated[list[str], NoDecode] = Field(
        default_factory=lambda: ["http://localhost:5173"],
        alias="CORS_ORIGINS",
    )
    auth_jwt_secret: str = Field(alias="AUTH_JWT_SECRET")
    auth_jwt_access_ttl_minutes: int = Field(
        default=15,
        alias="AUTH_JWT_ACCESS_TTL_MINUTES",
    )
    auth_jwt_refresh_ttl_days: int = Field(
        default=30,
        alias="AUTH_JWT_REFRESH_TTL_DAYS",
    )
    google_oauth_client_id: str | None = Field(
        default=None,
        alias="GOOGLE_OAUTH_CLIENT_ID",
    )
    openai_api_key: str | None = Field(default=None, alias="OPENAI_API_KEY")
    openai_model: str = Field(default="gpt-5-nano", alias="OPENAI_MODEL")
    chat_max_tool_calls: int = Field(default=8, alias="CHAT_MAX_TOOL_CALLS")
    chat_max_message_chars: int = Field(
        default=4000,
        alias="CHAT_MAX_MESSAGE_CHARS",
    )
    chat_websocket_path: str = Field(
        default="/api/v1/chat/ws",
        alias="CHAT_WEBSOCKET_PATH",
    )

    @field_validator("database_url", mode="before")
    @classmethod
    def normalize_database_url_value(cls, value: str):
        return normalize_database_url(value)

    @field_validator("cors_origins", mode="before")
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
    def google_oauth_ready(self) -> bool:
        return bool(self.google_oauth_client_id)

    @property
    def openai_ready(self) -> bool:
        return bool(self.openai_api_key)


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
