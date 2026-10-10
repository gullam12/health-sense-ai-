from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.api.v1.api import api_router
from app.db.init_db import init_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Lifespan startup: initialize database tables and seeds
    print(f"[*] Starting {settings.PROJECT_NAME} v{settings.VERSION}")
    print(f"[*] Environment: {settings.ENVIRONMENT}")
    print(f"[*] CORS Allowed Origins: {settings.BACKEND_CORS_ORIGINS}")
    print(f"[*] Initializing Database & executing migrations...")
    try:
        await init_database()
        print("[OK] Database tables and seed records verified.")
    except Exception as e:
        print(f"[!] Database initialization notice: {e}")

    print("[*] Loading ML model artifacts...")
    try:
        from app.services.ml_engine import load_ml_models
        load_ml_models()
    except Exception as e:
        print(f"[!] ML model loading notice: {e}")

    print("[*] Probing Supabase Cloud Database...")
    try:
        from app.services.supabase_service import get_supabase_client
        sb_client = get_supabase_client()
        if sb_client:
            print(f"[OK] Supabase Cloud Client Active: {settings.SUPABASE_URL}")
    except Exception as e:
        print(f"[!] Supabase initialization notice: {e}")

    yield
    # Lifespan shutdown
    print(f"[*] Shutting down {settings.PROJECT_NAME}")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Production-grade AI disease prediction & clinical decision support API compliant with IEEE 830 / ISO/IEC/IEEE 29148.",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan
)

# CORS Middleware (React Frontend whitelist)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global unhandled exception handler (OWASP guideline: prevent stack trace leakage)
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An internal server error occurred. Please contact clinical administration.",
            "type": "InternalServerError"
        }
    )

# Include API v1 Router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "HealthSense AI Diagnostic Engine Active",
        "documentation": f"{settings.API_V1_STR}/docs",
        "health": f"{settings.API_V1_STR}/health",
        "version": settings.VERSION
    }
