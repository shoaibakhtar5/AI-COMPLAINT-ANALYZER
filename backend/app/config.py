from functools import lru_cache
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


DEFAULT_DEV_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]


def normalize_database_url(database_url: str) -> str:
    if database_url.startswith("postgresql://"):
        return database_url.replace("postgresql://", "postgresql+psycopg://", 1)
    return database_url


class Settings(BaseSettings):
    app_name: str = "Sentra AI API"
    api_prefix: str = "/api"
    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/sentra_ai"
    jwt_secret_key: str = "change-this-to-a-long-random-secret"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    refresh_token_expire_days: int = 14
    frontend_origins: str = ",".join(DEFAULT_DEV_ORIGINS)
    frontend_origin_regex: str = r"https?://(localhost|127\.0\.0\.1):\d+"
    storage_dir: str = "storage"
    upload_dir: str = "storage/uploads"
    avatar_dir: str = "storage/avatars"
    export_dir: str = "storage/exports"
    ai_category_model_dir: str = "app/ai/models/category"
    ai_sentiment_model_dir: str = "app/ai/models/sentiment"
    ai_priority_model_dir: str = "app/ai/models/priority"
    ai_category_model_id: str | None = None
    ai_sentiment_model_id: str | None = None
    ai_priority_model_id: str | None = None
    hf_token: str | None = None
    ai_device: str = "auto"
    ai_max_length: int = 256
    ai_model_path: str = "app/ai/model.pkl"
    ai_vectorizer_path: str = "app/ai/vectorizer.pkl"
    seed_demo_data: bool = False

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    def ensure_storage_dirs(self) -> None:
        for directory in [self.storage_dir, self.upload_dir, self.avatar_dir, self.export_dir]:
            Path(directory).mkdir(parents=True, exist_ok=True)

    @property
    def sqlalchemy_database_url(self) -> str:
        return normalize_database_url(self.database_url)

    @property
    def cors_allowed_origins(self) -> list[str]:
        configured = [item.strip() for item in self.frontend_origins.split(",") if item.strip()]
        return sorted(set([*DEFAULT_DEV_ORIGINS, *configured]))


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
