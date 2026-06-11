import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import SQLAlchemyError

from app.database import Base, engine
from app.db_health import check_database_connection
from app.routers import todos

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Todo API", version="1.0.0")

BACKEND_URL = os.getenv(
    "BACKEND_URL",
    "https://perfect-courtesy-production-44b9.up.railway.app",
)
FRONTEND_URL = os.getenv("FRONTEND_URL", "")

default_origins = [
    "http://localhost:5173",
    FRONTEND_URL,
    os.getenv("CORS_ORIGINS", ""),
]
allowed_origins = [
    origin.strip()
    for origin in default_origins
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


@app.get("/")
def root():
    return {
        "service": "Todo API",
        "backend": BACKEND_URL,
        "frontend": FRONTEND_URL or "Deploy the frontend service to get a URL",
        "endpoints": {
            "health": f"{BACKEND_URL}/api/health",
            "todos": f"{BACKEND_URL}/api/todos",
            "docs": f"{BACKEND_URL}/docs",
        },
    }


@app.get("/api/health")
def health():
    try:
        check_database_connection()
        return {"status": "ok", "database": "connected"}
    except SQLAlchemyError as exc:
        return {"status": "degraded", "database": "disconnected", "detail": str(exc)}
