from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import Settings, get_settings
from app.core.telemetry import configure_telemetry
from app.schedules.repository import (
    ScheduleRepository,
    ScheduleRepositoryError,
    build_repository,
)
from app.schedules.router import router as schedules_router
from app.schedules.service import ScheduleNotFoundError, ScheduleService


def create_app(
    *,
    settings: Settings | None = None,
    repository: ScheduleRepository | None = None,
) -> FastAPI:
    app_settings = settings or get_settings()
    schedule_repository = repository or build_repository(app_settings)

    @asynccontextmanager
    async def lifespan(_: FastAPI) -> AsyncIterator[None]:
        yield
        schedule_repository.close()

    app = FastAPI(
        title="맞다톤 일정 관리 API",
        version="1.0.0",
        lifespan=lifespan,
    )
    app.state.schedule_service = ScheduleService(schedule_repository)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=app_settings.allowed_origins,
        allow_credentials=False,
        allow_methods=["GET", "POST", "PUT", "DELETE"],
        allow_headers=["Content-Type"],
    )

    @app.exception_handler(ScheduleNotFoundError)
    async def handle_not_found(
        _: Request, exc: ScheduleNotFoundError
    ) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"detail": str(exc)},
        )

    @app.exception_handler(ScheduleRepositoryError)
    async def handle_repository_error(
        _: Request, exc: ScheduleRepositoryError
    ) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"detail": str(exc)},
        )

    @app.get("/health", tags=["health"])
    async def health() -> dict[str, str]:
        return {"status": "ok"}

    app.include_router(schedules_router)
    configure_telemetry(app, app_settings)
    return app


app = create_app()
