from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.config import settings
from app.database import Base, engine
from app.middleware.security_headers import SecurityHeadersMiddleware
from app.core.limiter import limiter
import app.models  # noqa: F401 — register all models

# Import routers
from app.api.routes.auth import router as auth_router
from app.api.routes.buildings import router as buildings_router
from app.api.routes.audits import router as audits_router
from app.api.routes.scenarios import router as scenarios_router
from app.api.routes.reports import router as reports_router
from app.api.routes.billing import router as billing_router
from app.api.routes.api_keys import router as api_keys_router
from app.api.routes.exports import router as exports_router
from app.api.routes.ml import router as ml_router

# Create all tables on startup (use Alembic in production)
Base.metadata.create_all(bind=engine)

# Désactiver la doc Swagger/ReDoc en production
_docs_url = None if settings.environment == "production" else "/docs"
_redoc_url = None if settings.environment == "production" else "/redoc"

app = FastAPI(
    title="ThermoPilot AI",
    description="Plateforme SaaS d'analyse énergétique automatisée pour les bâtiments",
    version="2.0.0",
    docs_url=_docs_url,
    redoc_url=_redoc_url,
    debug=settings.debug,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Security headers sur toutes les réponses
app.add_middleware(SecurityHeadersMiddleware)

# CORS — origines chargées depuis la config/env
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-API-Key"],
)

# Mount API routes
app.include_router(auth_router, prefix="/api")
app.include_router(buildings_router, prefix="/api")
app.include_router(audits_router, prefix="/api")
app.include_router(scenarios_router, prefix="/api")
app.include_router(reports_router, prefix="/api")
app.include_router(billing_router, prefix="/api")
app.include_router(api_keys_router, prefix="/api")
app.include_router(exports_router, prefix="/api")
app.include_router(ml_router, prefix="/api")


@app.get("/", tags=["health"])
def root():
    return {
        "app": "ThermoPilot AI",
        "version": "2.0.0",
        "status": "running",
    }


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok"}
