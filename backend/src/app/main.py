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
    """
    # Startup
    logger.info("Starting up application...")
    await create_db_and_tables()
    logger.info("Database tables created/verified")

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
        raise

    # Include API routes with /api prefix
    app.include_router(health_router, prefix="/api")
    app.include_router(auth_router, prefix="/api")
    app.include_router(users_router, prefix="/api")
    app.include_router(tasks_router, prefix="/api")

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
