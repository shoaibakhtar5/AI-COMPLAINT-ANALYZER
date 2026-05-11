from functools import lru_cache
from pathlib import Path
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Sentra AI API"
    api_prefix: str = "/api"
    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/sentra_ai"
    jwt_secret_key: str = "change-this-to-a-long-random-secret"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    refresh_token_expire_days: int = 14
    frontend_origins: list[str] = ["http://127.0.0.1:5173", "http://localhost:5173"]
    storage_dir: str = "storage"
    upload_dir: str = "storage/uploads"
    avatar_dir: str = "storage/avatars"
    export_dir: str = "storage/exports"
    ai_model_path: str = "app/ai/model.pkl"
    ai_vectorizer_path: str = "app/ai/vectorizer.pkl"
    seed_demo_data: bool = True

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @field_validator("frontend_origins", mode="before")
    @classmethod
    def parse_origins(cls, value):
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        return value

    def ensure_storage_dirs(self) -> None:
        for directory in [self.storage_dir, self.upload_dir, self.avatar_dir, self.export_dir]:
            Path(directory).mkdir(parents=True, exist_ok=True)


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
