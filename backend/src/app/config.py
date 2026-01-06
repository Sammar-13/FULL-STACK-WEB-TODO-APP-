"""Application configuration using Pydantic settings (Task 02-024)."""

from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration loaded from environment variables.

    Uses pydantic_settings to load configuration from .env file with
    validation and type checking.

    Attributes:
        DATABASE_URL: PostgreSQL connection string
        JWT_SECRET_KEY: Secret key for JWT token signing
        JWT_ALGORITHM: Algorithm for JWT signing (default: HS256)
        ACCESS_TOKEN_EXPIRE_HOURS: Access token TTL in hours
        REFRESH_TOKEN_EXPIRE_DAYS: Refresh token TTL in days
        BCRYPT_ROUNDS: Number of rounds for bcrypt hashing
        CORS_ORIGINS: Comma-separated list of allowed CORS origins
        DEBUG: Debug mode flag
        ENVIRONMENT: Environment name (development, staging, production)
        LOG_LEVEL: Logging level
        SERVER_HOST: Server bind host
        SERVER_PORT: Server bind port
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # Database
    # Use os.getenv to avoid hardcoded defaults in production
    # Fallback to sqlite memory for testing/builds if not set
    DATABASE_URL: str = "sqlite+aiosqlite:///:memory:" 


    # JWT Configuration
    JWT_SECRET_KEY: str = "dev-secret-key-for-testing-only-minimum-32-chars-long"
    """Secret key for JWT signing (minimum 32 characters)"""

    JWT_ALGORITHM: str = "HS256"
    """JWT signing algorithm"""

    ACCESS_TOKEN_EXPIRE_HOURS: int = 24
    """Access token expiration time in hours"""

    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    """Refresh token expiration time in days"""

    # Security
    BCRYPT_ROUNDS: int = 10
    """Number of rounds for bcrypt password hashing"""

    CORS_ORIGINS: str = "http://localhost:3000,https://full-stack-web-todo-app.vercel.app,https://sammar20-todo-backend.hf.space"
    """Comma-separated list of allowed CORS origins"""

    # Application
    DEBUG: bool = False
    """Debug mode flag"""

    ENVIRONMENT: str = "development"
    """Environment: development, staging, or production"""

    LOG_LEVEL: str = "INFO"
    """Logging level"""

    SERVER_HOST: str = "0.0.0.0"
    """Server bind host address"""

    SERVER_PORT: int = 8000
    """Server bind port"""

    def validate(self) -> None:
        """Validate critical configuration settings.

        Raises:
            ValueError: If any critical setting is missing or invalid

        Note: This is NOT called at import time to avoid crashes in serverless environments.
        Call this manually in route handlers or startup events if needed.
        """
        if not self.DATABASE_URL:
            raise ValueError("DATABASE_URL is required")

        if not (self.DATABASE_URL.startswith("postgresql") or self.DATABASE_URL.startswith("sqlite")):
            raise ValueError("DATABASE_URL must be a valid PostgreSQL or SQLite connection string")

        if len(self.JWT_SECRET_KEY) < 32:
            raise ValueError("JWT_SECRET_KEY must be at least 32 characters")

        if self.BCRYPT_ROUNDS < 4 or self.BCRYPT_ROUNDS > 31:
            raise ValueError("BCRYPT_ROUNDS must be between 4 and 31")

        if self.ACCESS_TOKEN_EXPIRE_HOURS < 1:
            raise ValueError("ACCESS_TOKEN_EXPIRE_HOURS must be at least 1")

        if self.REFRESH_TOKEN_EXPIRE_DAYS < 1:
            raise ValueError("REFRESH_TOKEN_EXPIRE_DAYS must be at least 1")

    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS_ORIGINS string into a list.

        Returns:
            List of allowed CORS origins
        """
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    @property
    def is_production(self) -> bool:
        """Check if application is running in production.

        Returns:
            True if environment is production
        """
        return self.ENVIRONMENT.lower() == "production"


# Global settings instance
settings = Settings()
