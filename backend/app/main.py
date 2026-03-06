from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import Base, engine
import app.models  # noqa: F401 — register all models

# Import routers
from app.api.routes.auth import router as auth_router
from app.api.routes.buildings import router as buildings_router
from app.api.routes.audits import router as audits_router
from app.api.routes.scenarios import router as scenarios_router
from app.api.routes.reports import router as reports_router

# Create all tables on startup (use Alembic in production)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ThermoPilot AI",
    description="Plateforme SaaS d'analyse énergétique automatisée pour les bâtiments",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://frontend:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routes
app.include_router(auth_router, prefix="/api")
app.include_router(buildings_router, prefix="/api")
app.include_router(audits_router, prefix="/api")
app.include_router(scenarios_router, prefix="/api")
app.include_router(reports_router, prefix="/api")


@app.get("/", tags=["health"])
def root():
    return {
        "app": "ThermoPilot AI",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok"}
