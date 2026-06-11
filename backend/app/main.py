import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.exc import SQLAlchemyError

from app.database import Base, engine
from app.db_health import check_database_connection
from app.routers import todos

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Todo API", version="1.0.0")

STATIC_DIR = Path(__file__).resolve().parent.parent / "static"
SERVE_FRONTEND = STATIC_DIR.exists() and (STATIC_DIR / "index.html").exists()

if not SERVE_FRONTEND:
    allowed_origins = [
        origin.strip().rstrip("/")
        for origin in [
            "http://localhost:5173",
            os.getenv("FRONTEND_URL", ""),
            os.getenv("CORS_ORIGINS", ""),
        ]
        if origin and origin.strip()
    ]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(todos.router)


@app.get("/api/health")
def health():
    try:
        check_database_connection()
        return {"status": "ok", "database": "connected", "frontend": SERVE_FRONTEND}
    except SQLAlchemyError as exc:
        return {"status": "degraded", "database": "disconnected", "detail": str(exc)}


if SERVE_FRONTEND:
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="frontend")
else:

    @app.get("/")
    def root():
        return {
            "service": "Todo API",
            "message": "Frontend static files not found. Use Docker build or run frontend separately.",
            "health": "/api/health",
            "docs": "/docs",
            "todos": "/api/todos",
        }
