import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Quiz Generator & Learning Platform"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = "supersecretjwtkey_change_in_production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    ALGORITHM: str = "HS256"

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./sql_app.db"

    # AI / LLM Config
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    DEFAULT_MODEL: str = "gemini-2.5-flash"

    # Qdrant Vector Store
    QDRANT_MODE: str = "local"  # "local" or "server"
    QDRANT_PATH: str = "./qdrant_storage"
    QDRANT_HOST: str = "localhost"
    QDRANT_PORT: int = 6333
    QDRANT_COLLECTION: str = "document_chunks"

    # Upload configuration
    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE_MB: int = 25

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
