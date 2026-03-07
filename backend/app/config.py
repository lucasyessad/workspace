from pydantic_settings import BaseSettings
from pydantic import model_validator
from typing import Literal, List


class Settings(BaseSettings):
    # App
    app_name: str = "ThermoPilot AI"
    environment: Literal["development", "production", "test"] = "development"

    @property
    def debug(self) -> bool:
        return self.environment == "development"

    # Database
    database_url: str = "postgresql://thermopilot:thermopilot_secret@localhost:5432/thermopilot"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # Security
    secret_key: str = "change_me_in_production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30  # Réduit à 30 minutes (best practice)

    # API Key HMAC secret (distinct du secret JWT)
    api_key_hmac_secret: str = "change_me_api_key_hmac_secret"

    # CORS
    cors_origins: List[str] = ["http://localhost:3000"]

    # Storage
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""
    aws_region: str = "eu-west-3"
    s3_bucket_name: str = "thermopilot-files"

    @model_validator(mode="after")
    def check_production_secrets(self) -> "Settings":
        if self.environment == "production":
            insecure_defaults = {
                "change_me_in_production",
                "change_me_api_key_hmac_secret",
            }
            if self.secret_key in insecure_defaults:
                raise ValueError(
                    "SECRET_KEY doit être défini via variable d'environnement en production"
                )
            if self.api_key_hmac_secret in insecure_defaults:
                raise ValueError(
                    "API_KEY_HMAC_SECRET doit être défini via variable d'environnement en production"
                )
        return self

    class Config:
        env_file = ".env"


settings = Settings()
