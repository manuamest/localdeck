import asyncio
from datetime import UTC, datetime

import httpx

from app.config import Settings
from app.models import ServiceRecord
from app.registry import ServiceRegistry
from app.scanner.html import extract_favicon_url, extract_title
from app.scanner.ports import parse_scan_ports
from app.scanner.probe import HttpProbeResult, probe_http


def service_from_probe(settings: Settings, port: int, result: HttpProbeResult, checked_at: datetime) -> ServiceRecord:
    title = extract_title(result.text) or f"Service on port {port}"
    return ServiceRecord(
        id=f"http-{settings.host}-{port}",
        title=title,
        url=result.url,
        display_url=f"http://localhost:{port}",
        host=settings.host,
        port=port,
        protocol="http",
        status_code=result.status_code,
        response_time_ms=result.response_time_ms,
        favicon_url=extract_favicon_url(result.text, result.url),
        last_seen=checked_at,
        last_checked=checked_at,
        error=None,
    )


async def scan_services(settings: Settings) -> tuple[datetime, list[ServiceRecord]]:
    checked_at = datetime.now(UTC)
    ports = [port for port in parse_scan_ports(settings.scan_ports) if port != settings.port]

    async with httpx.AsyncClient(timeout=settings.request_timeout, follow_redirects=False) as client:
        results = await asyncio.gather(
            *(probe_http(settings.host, port, settings.request_timeout, client=client) for port in ports)
        )

    services = [
        service_from_probe(settings, port, result, checked_at)
        for port, result in zip(ports, results, strict=True)
        if result is not None
    ]
    return checked_at, services


async def scan_loop(settings: Settings, registry: ServiceRegistry) -> None:
    while True:
        scanned_at, services = await scan_services(settings)
        registry.replace(services, scanned_at)
        await asyncio.sleep(settings.scan_interval)
