from datetime import datetime

from pydantic import BaseModel, Field


class ServiceRecord(BaseModel):
    id: str
    title: str
    url: str
    display_url: str
    host: str
    port: int = Field(ge=1, le=65535)
    protocol: str
    status_code: int = Field(ge=100, le=599)
    response_time_ms: int = Field(ge=0)
    favicon_url: str | None = None
    last_seen: datetime
    last_checked: datetime
    error: str | None = None


class ServicesResponse(BaseModel):
    scanned_at: datetime | None = None
    scan_interval: int
    services: list[ServiceRecord]
