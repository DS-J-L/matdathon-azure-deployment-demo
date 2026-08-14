from fastapi import APIRouter, Depends, Request, Response, status

from app.schedules.schemas import Schedule, ScheduleCreate, ScheduleUpdate
from app.schedules.service import ScheduleService

router = APIRouter(prefix="/api/schedules", tags=["schedules"])


def get_schedule_service(request: Request) -> ScheduleService:
    return request.app.state.schedule_service


@router.get("", response_model=list[Schedule])
async def list_schedules(
    service: ScheduleService = Depends(get_schedule_service),
) -> list[Schedule]:
    return await service.list()


@router.post("", response_model=Schedule, status_code=status.HTTP_201_CREATED)
async def create_schedule(
    data: ScheduleCreate,
    service: ScheduleService = Depends(get_schedule_service),
) -> Schedule:
    return await service.create(data)


@router.get("/{schedule_id}", response_model=Schedule)
async def get_schedule(
    schedule_id: str,
    service: ScheduleService = Depends(get_schedule_service),
) -> Schedule:
    return await service.get(schedule_id)


@router.put("/{schedule_id}", response_model=Schedule)
async def update_schedule(
    schedule_id: str,
    data: ScheduleUpdate,
    service: ScheduleService = Depends(get_schedule_service),
) -> Schedule:
    return await service.update(schedule_id, data)


@router.delete("/{schedule_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_schedule(
    schedule_id: str,
    service: ScheduleService = Depends(get_schedule_service),
) -> Response:
    await service.delete(schedule_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
