from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import ValidationError
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import SessionLocal
from app.routes import ai, analytics, auth, complaints, integrations, public, settings as settings_routes, uploads
from app.services.seed import seed_demo_data


app = FastAPI(
    
    title=settings.app_name,
    version="1.0.0",
    description="Production-style API for AI complaint intelligence, analytics, uploads, and enterprise workspace management.",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.frontend_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

settings.ensure_storage_dirs()
app.mount("/storage", StaticFiles(directory=settings.storage_dir), name="storage")

app.include_router(auth.router, prefix="/api")
app.include_router(complaints.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(uploads.router, prefix="/api")
app.include_router(ai.router, prefix="/api")
app.include_router(settings_routes.router, prefix="/api")
app.include_router(integrations.router, prefix="/api")
app.include_router(public.router, prefix="/api")


@app.on_event("startup")
def on_startup():
    settings.ensure_storage_dirs()
    if settings.seed_demo_data:
        with SessionLocal() as db:
            seed_demo_data(db)


@app.get("/api/health", tags=["System"])
def health():
    return {"status": "ok", "service": settings.app_name}


@app.exception_handler(ValidationError)
async def validation_exception_handler(_: Request, exc: ValidationError):
    return JSONResponse(status_code=422, content={"detail": exc.errors(), "message": "Request validation failed"})


@app.exception_handler(Exception)
async def unhandled_exception_handler(_: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"detail": "Internal server error", "message": str(exc)})
