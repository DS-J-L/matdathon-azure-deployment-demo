from datetime import datetime
from typing import Literal, Self

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

ScheduleCategory = Literal["official", "team", "deadline", "personal"]
ScheduleStatus = Literal["scheduled", "completed"]


class ScheduleWrite(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    title: str = Field(min_length=1, max_length=50)
    description: str = Field(default="", max_length=500)
    start_at: datetime = Field(alias="startAt")
    end_at: datetime = Field(alias="endAt")
    category: ScheduleCategory
    status: ScheduleStatus = "scheduled"

    @field_validator("title", "description", mode="before")
    @classmethod
    def trim_text(cls, value: object) -> object:
        return value.strip() if isinstance(value, str) else value

    @model_validator(mode="after")
    def validate_date_range(self) -> Self:
        if self.end_at <= self.start_at:
            raise ValueError("종료 시간은 시작 시간보다 늦어야 합니다.")
        return self


class ScheduleCreate(ScheduleWrite):
    pass


class ScheduleUpdate(ScheduleWrite):
    pass


class Schedule(ScheduleWrite):
    id: str
    created_at: datetime = Field(alias="createdAt")
