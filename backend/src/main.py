import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.config import settings
from src.auth.router import router as auth_router
from src.api.v1.medications import router as medications_router
from src.api.v1.events import router as events_router


def _configure_logging() -> None:
    level = logging.DEBUG if settings.debug else logging.INFO
    logging.basicConfig(
        level=level,
        format="%(asctime)s %(levelname)s %(name)s - %(message)s",
    )


def create_app() -> FastAPI:
    _configure_logging()

    app = FastAPI(
        title="FirstFill API",
        version="0.1.0",
        description="Prescribing decision-support for dermatology.",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_methods=["GET", "POST"],
        allow_headers=["*"],
    )

    app.include_router(auth_router, prefix="/api/v1")
    app.include_router(medications_router, prefix="/api/v1")
    app.include_router(events_router, prefix="/api/v1")

    @app.get("/health")
    def health() -> dict:
        return {"status": "ok"}

    return app


app = create_app()
