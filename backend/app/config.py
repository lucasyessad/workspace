from pydantic_settings import BaseSettings
from typing import Literal


class Settings(BaseSettings):
    # App
    app_name: str = "ThermoPilot AI"
    environment: Literal["development", "production", "test"] = "development"
    debug: bool = True

    # Database
    database_url: str = "postgresql://thermopilot:thermopilot_secret@localhost:5432/thermopilot"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # Security
    secret_key: str = "change_me_in_production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440  # 24h

    # Storage
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""
    aws_region: str = "eu-west-3"
    s3_bucket_name: str = "thermopilot-files"

    class Config:
        env_file = ".env"


settings = Settings()
