from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Intranet Docente"
    app_env: str = "development"
    mongo_uri: str = "mongodb://localhost:27017"
    database_name: str = "intranet"
    secret_key: str = ""
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30
    jwt_refresh_token_expire_days: int = 7
    initial_admin_email: str | None = None
    initial_admin_name: str | None = None
    initial_admin_password: str | None = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()


def validate_runtime_settings(settings: Settings) -> None:
    if len(settings.secret_key) < 32:
        raise ValueError("SECRET_KEY debe tener al menos 32 caracteres.")
    if settings.jwt_algorithm != "HS256":
        raise ValueError("Solo se admite el algoritmo JWT HS256 en esta configuracion.")
    if settings.jwt_access_token_expire_minutes < 1:
        raise ValueError("JWT_ACCESS_TOKEN_EXPIRE_MINUTES debe ser mayor que cero.")
    if settings.jwt_refresh_token_expire_days < 1:
        raise ValueError("JWT_REFRESH_TOKEN_EXPIRE_DAYS debe ser mayor que cero.")
