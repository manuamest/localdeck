from datetime import datetime

from app.models import ServiceRecord, ServicesResponse


class ServiceRegistry:
    def __init__(self, scan_interval: int) -> None:
        self._scan_interval = scan_interval
        self._scanned_at: datetime | None = None
        self._services: list[ServiceRecord] = []

    def snapshot(self) -> ServicesResponse:
        return ServicesResponse(
            scanned_at=self._scanned_at,
            scan_interval=self._scan_interval,
            services=list(self._services),
        )

    def replace(self, services: list[ServiceRecord], scanned_at: datetime) -> None:
        self._services = list(services)
        self._scanned_at = scanned_at
