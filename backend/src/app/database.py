"""Database configuration and session management."""

import logging
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.pool import NullPool
from sqlmodel import SQLModel
from sqlmodel.ext.asyncio.session import AsyncSession

from .config import settings

logger = logging.getLogger("app")


# Create async database engine lazily
# This function is called when first needed, not at import time
def _create_engine():
    """Create database engine (lazy initialization for serverless)."""
    db_url = settings.DATABASE_URL
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif db_url.startswith("postgresql://"):
        db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

    if db_url.startswith("sqlite"):
        return create_async_engine(
            db_url,
            echo=settings.DEBUG,
            connect_args={"check_same_thread": False},
        )
    else:
        return create_async_engine(
            db_url,
            echo=settings.DEBUG,
            poolclass=NullPool,  # Neon has connection limits, don't pool
            connect_args={
                "server_settings": {
                    "application_name": "hackathon_todo",
                },
                "ssl": "require",  # Enforce SSL for Neon
                "timeout": 10,  # 10 second connection timeout
            },
        )

engine = _create_engine()

# Create async session factory
async_session = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)


async def create_db_and_tables() -> None:
    """Create all database tables defined in SQLModel.

    This should be called during application startup to ensure
    all required tables exist. In production, use Alembic migrations instead.
    """
    try:
        async with engine.begin() as conn:
            await conn.run_sync(SQLModel.metadata.create_all)
        logger.info("Database tables created/verified successfully")
    except SQLAlchemyError as e:
        error_msg = str(e)
        if "could not translate host name" in error_msg or "Name or service not known" in error_msg:
            logger.warning("Database offline - skipping table creation")
            return
        logger.error(f"Database initialization failed: {error_msg}")
        raise RuntimeError(f"Failed to create database tables: {e}") from e


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """Get an async database session for dependency injection.

    Yields:
        AsyncSession instance

    Usage:
        @app.get("/items")
        async def read_items(session: AsyncSession = Depends(get_session)):
            result = await session.execute(select(Item))
            return result.scalars().all()
    """
    from fastapi import HTTPException

    session = None
    try:
        session = async_session()
        async with session as sess:
            try:
                yield sess
            except HTTPException:
                # Let FastAPI handle HTTP exceptions raised in endpoints
                raise
            except SQLAlchemyError as e:
                logger.error(f"SQLAlchemy error during query: {e}")
                await sess.rollback()
                raise RuntimeError(f"Database error: {e}") from e
            except Exception as e:
                logger.error(f"Unexpected error in session: {e}", exc_info=True)
                await sess.rollback()
                raise
            finally:
                await sess.close()
    except HTTPException:
        # Let FastAPI handle HTTP exceptions raised in endpoints
        raise
    except Exception as e:
        logger.error(f"Failed to create or use session: {e}", exc_info=True)
        raise RuntimeError(f"Database session error: {e}") from e
