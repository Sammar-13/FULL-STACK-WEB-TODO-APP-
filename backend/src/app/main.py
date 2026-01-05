"""FastAPI application factory and configuration (Task 02-049)."""

import logging
from contextlib import asynccontextmanager

from fastapi import APIRouter, FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import OperationalError

from .api.v1.auth import router as auth_router
from .api.v1.health import router as health_router
from .api.v1.tasks import router as tasks_router
from .api.v1.users import router as users_router
from .config import settings
from .database import create_db_and_tables
from .middleware.rate_limit import rate_limit_middleware

logger = logging.getLogger("app")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan.

    Handles startup and shutdown events.
    Note: On Vercel serverless, lifespan events may not be reliable.
    """
    import asyncio
    
    # Startup
    logger.info("Starting up application...")
    try:
        # Try to create tables, but give up after 5 seconds so app can start
        # The database might be waking up (Neon cold start takes ~3-5s)
        await asyncio.wait_for(create_db_and_tables(), timeout=5.0)
        logger.info("Database tables created/verified")
    except asyncio.TimeoutError:
         logger.warning("Database table creation timed out (continuing startup). Tables will be created on next run.")
    except Exception as e:
        # Catch ALL errors so the app never crashes during startup
        logger.warning(f"Database initialization failed (safe to ignore on cold start): {e}")

    yield

    # Shutdown
    logger.info("Shutting down application...")


def create_app() -> FastAPI:
    """Create and configure FastAPI application (Task 02-049).

    Returns:
        Configured FastAPI application instance
    """
    app = FastAPI(
        title="Hackathon Todo API",
        description="Multi-user todo application API",
        version="0.2.0",
        docs_url="/docs",  # ← Changed: Swagger UI at both /docs and /api/docs
        openapi_url="/openapi.json",  # ← Changed: OpenAPI schema at both /openapi.json and /api/openapi.json
        redoc_url="/redoc",  # ← Changed: ReDoc at both /redoc and /api/redoc
        lifespan=lifespan,
       
    )

    # Database error handler
    @app.exception_handler(OperationalError)
    async def operational_error_handler(request: Request, exc: OperationalError):
        """Handle database connection errors gracefully."""
        error_str = str(exc)
        if "could not translate host name" in error_str or "timeout" in error_str.lower():
            return JSONResponse(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                content={
                    "detail": "Database is currently offline. Please try again when the database is online.",
                    "error_code": "DATABASE_OFFLINE",
                },
            )
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "detail": "Database error occurred",
                "error_code": "DATABASE_ERROR",
            },
        )

    @app.exception_handler(RuntimeError)
    async def runtime_error_handler(request: Request, exc: RuntimeError):
        """Handle runtime errors from database dependency injection."""
        error_str = str(exc)
        if "offline" in error_str.lower() or "connection" in error_str.lower():
            return JSONResponse(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                content={
                    "detail": "Database is currently offline. Please try again when the database is online.",
                    "error_code": "DATABASE_OFFLINE",
                },
            )
        
        # Catch all other RuntimeErrors (including other DB errors)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "detail": f"Internal Server Error: {error_str}",
                "error_code": "INTERNAL_ERROR",
            },
        )


    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        """Global exception handler to catch any unhandled errors."""
        import traceback
        error_str = str(exc)
        traceback_str = traceback.format_exc()
        
        # Log the full traceback
        logger.error(f"Unhandled exception: {error_str}\n{traceback_str}")
        
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "detail": f"Internal Server Error: {error_str}",
                "error_code": "INTERNAL_ERROR",
                "type": type(exc).__name__
            },
        )

    # Include API routes with /api prefix
    app.include_router(health_router, prefix="/api")
    app.include_router(auth_router, prefix="/api")
    app.include_router(users_router, prefix="/api")
    app.include_router(tasks_router, prefix="/api")

    @app.get("/api/diagnose")
    async def diagnose_system() -> dict:
        """Diagnostic endpoint to check system status (Safe for production)."""
        import sys
        import os
        from .config import settings
        from sqlalchemy import text
        from .database import engine

        # Check Environment Variables
        env_vars = {
            "DATABASE_URL": "Set" if settings.DATABASE_URL else "Missing",
            "JWT_SECRET_KEY": "Set" if len(settings.JWT_SECRET_KEY) >= 32 else "Weak/Missing",
            "ENVIRONMENT": settings.ENVIRONMENT,
            "DEBUG": settings.DEBUG,
            "VERCEL": os.environ.get("VERCEL", "0"),
            "PYTHON_VERSION": sys.version,
        }

        # Check Database Connection
        db_status = "Unknown"
        db_error = None
        try:
            async with engine.connect() as conn:
                await conn.execute(text("SELECT 1"))
                db_status = "Connected"
        except Exception as e:
            db_status = "Failed"
            db_error = str(e)

        return {
            "status": "diagnostic",
            "environment": env_vars,
            "database": {
                "status": db_status,
                "error": db_error,
                "url_prefix": settings.DATABASE_URL.split("://")[0] if "://" in settings.DATABASE_URL else "Invalid",
            }
        }

    # Health check endpoint at root
    @app.get("/health")
    def health_check() -> dict:
        """Health check endpoint."""
        return {"status": "healthy"}

    # Root endpoint
    @app.get("/")
    def root() -> dict:
        """API root endpoint with documentation links."""
        return {
            "message": "Hackathon Todo API",
            "version": "0.2.0",
            "docs": "/docs",
            "openapi": "/openapi.json",
            "redoc": "/redoc",
        }


    # Add rate limiting middleware
    @app.middleware("http")
    async def rate_limit_wrapper(request: Request, call_next):
        """Rate limiting middleware wrapper."""
        return await rate_limit_middleware(request, call_next)

    # Add Cache-Control headers middleware
    @app.middleware("http")
    async def add_cache_headers(request: Request, call_next):
        """Add appropriate Cache-Control headers to responses.

        Caches static assets and health checks, but not authenticated API responses.
        """
        response = await call_next(request)

        # Cache static assets for 7 days
        if request.url.path.startswith(("/static/", "/.next/")):
            response.headers["Cache-Control"] = "public, max-age=604800"

        # Cache health check for 5 minutes
        elif request.url.path == "/health" or request.url.path == "/api/health":
            response.headers["Cache-Control"] = "public, max-age=300"

        # Don't cache authenticated API responses (vary by cookie)
        elif request.url.path.startswith("/api/"):
            response.headers["Cache-Control"] = "private, no-cache, no-store, must-revalidate"
            response.headers["Pragma"] = "no-cache"
            response.headers["Expires"] = "0"

        return response

    # Configure middleware (order matters - add from last to first)
    # The middleware added LAST is executed FIRST (outermost).

    # 1. GZip (Inner)
    app.add_middleware(GZipMiddleware, minimum_size=1000)

    # 2. CORS (Outer - handles Preflight OPTIONS first)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
    )

    return app


# Create application instance
app = create_app()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.SERVER_HOST,
        port=settings.SERVER_PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
    )
