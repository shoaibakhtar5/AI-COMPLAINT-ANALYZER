import logging
import time

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import ValidationError
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.config import settings
from app.ai.model_loader import warmup_models
from app.database import Base, SessionLocal, engine
from app.models.core import *  # noqa: F401,F403 - register all ORM models before create_all
from app.routes import ai, analytics, auth, complaints, integrations, public, settings as settings_routes, super_admin, uploads
from app.services.seed import seed_demo_data
from app.services.super_admin import seed_default_super_admin


logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s [%(name)s] %(message)s")
logger = logging.getLogger("sentra-api")

app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="Production-style API for AI complaint intelligence, analytics, uploads, and enterprise workspace management.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allowed_origins,
    allow_origin_regex=settings.frontend_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def request_logger(request: Request, call_next):
    started_at = time.perf_counter()
    try:
        response = await call_next(request)
    except Exception:
        logger.exception("Unhandled request error %s %s", request.method, request.url.path)
        raise

    duration_ms = (time.perf_counter() - started_at) * 1000
    logger.info("%s %s -> %s %.1fms", request.method, request.url.path, response.status_code, duration_ms)
    return response


settings.ensure_storage_dirs()
app.mount("/storage", StaticFiles(directory=settings.storage_dir), name="storage")

app.include_router(auth.router, prefix="/api")
app.include_router(complaints.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(uploads.router, prefix="/api")
app.include_router(ai.router, prefix="/api")
app.include_router(settings_routes.router, prefix="/api")
app.include_router(integrations.router, prefix="/api")
app.include_router(super_admin.router, prefix="/api")
app.include_router(public.router, prefix="/api")


def check_database() -> tuple[bool, str]:
    try:
        with SessionLocal() as db:
            db.execute(text("SELECT 1"))
        return True, "connected"
    except SQLAlchemyError as exc:
        logger.exception("Database health check failed")
        return False, str(exc)


def initialize_database_schema() -> tuple[bool, str]:
    try:
        Base.metadata.create_all(bind=engine)
        return True, "tables ready"
    except SQLAlchemyError as exc:
        logger.exception("Database table initialization failed")
        return False, str(exc)


@app.on_event("startup")
def on_startup():
    logger.info("Starting %s", settings.app_name)
    logger.info("CORS origins: %s", ", ".join(settings.cors_allowed_origins))
    logger.info("CORS regex: %s", settings.frontend_origin_regex)
    settings.ensure_storage_dirs()

    schema_ok, schema_message = initialize_database_schema()
    if schema_ok:
        logger.info("Database tables initialized")
    else:
        logger.error("Database table initialization failed: %s", schema_message)
        return

    db_ok, db_message = check_database()
    if db_ok:
        logger.info("Database connection verified")
    else:
        logger.error("Database connection failed: %s", db_message)
        return

    if settings.seed_demo_data:
        try:
            with SessionLocal() as db:
                seed_demo_data(db)
            logger.info("Demo workspace seed check completed")
        except SQLAlchemyError as exc:
            logger.exception("Demo seed failed. Run Alembic migrations before using database-backed flows.")
            logger.error("Seed failure detail: %s", exc)

    try:
        with SessionLocal() as db:
            created = seed_default_super_admin(db)
        if created:
            logger.info("Default super admin seed created")
        else:
            logger.info("Default super admin seed already present")
    except SQLAlchemyError as exc:
        logger.exception("Super admin seed failed. Run Alembic migrations before using platform admin flows.")
        logger.error("Super admin seed failure detail: %s", exc)

    model_status = warmup_models()
    logger.info("AI model status: %s", model_status)
    logger.info("Application startup complete")


@app.get("/api/health", tags=["System"])
def health():
    db_ok, db_message = check_database()
    return {
        "status": "ok" if db_ok else "degraded",
        "service": settings.app_name,
        "database": {"ok": db_ok, "message": db_message},
        "cors_origins": settings.cors_allowed_origins,
        "ai_models": warmup_models(),
    }


@app.exception_handler(ValidationError)
async def validation_exception_handler(_: Request, exc: ValidationError):
    logger.warning("Validation error: %s", exc.errors())
    return JSONResponse(status_code=422, content={"detail": exc.errors(), "message": "Request validation failed"})


@app.exception_handler(Exception)
async def unhandled_exception_handler(_: Request, exc: Exception):
    logger.exception("Unhandled API error")
    return JSONResponse(status_code=500, content={"detail": "Internal server error", "message": str(exc)})
