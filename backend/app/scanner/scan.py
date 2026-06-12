import asyncio
from datetime import UTC, datetime

import httpx

from app.config import Settings
from app.models import ServiceRecord
from app.registry import ServiceRegistry
from app.scanner.html import extract_favicon_url, extract_title
from app.scanner.ports import parse_scan_ports
from app.scanner.probe import HttpProbeResult, probe_http_or_https


def service_from_probe(settings: Settings, port: int, result: HttpProbeResult, checked_at: datetime) -> ServiceRecord:
    title = extract_title(result.text)
    if title in {None, "Redirecting...", "Redirecting"}:
        title = f"Service on port {port}"

    return ServiceRecord(
        id=f"{result.protocol}-{settings.host}-{port}",
        title=title,
        url=result.url,
        display_url=f"{result.protocol}://localhost:{port}",
        host=settings.host,
        port=port,
        protocol=result.protocol,
        status_code=result.status_code,
        response_time_ms=result.response_time_ms,
        favicon_url=extract_favicon_url(result.text, result.url),
        last_seen=checked_at,
        last_checked=checked_at,
        error=None,
    )


def deduplicate_services(services: list[ServiceRecord]) -> list[ServiceRecord]:
    grouped: dict[tuple[str, str], list[ServiceRecord]] = {}
    entries: list[ServiceRecord | tuple[str, str]] = []

    for service in services:
        title_key = service.title.strip().casefold()
        if not title_key or title_key.startswith("service on port "):
            entries.append(service)
            continue

        key = (service.host, title_key)
        if key not in grouped:
            grouped[key] = []
            entries.append(key)
        grouped[key].append(service)

    deduplicated: list[ServiceRecord] = []
    for entry in entries:
        if isinstance(entry, ServiceRecord):
            deduplicated.append(entry)
            continue

        group = grouped[entry]
        https_services = [service for service in group if service.protocol == "https"]
        deduplicated.extend(https_services or group)

    return deduplicated


async def scan_services(settings: Settings) -> tuple[datetime, list[ServiceRecord]]:
    checked_at = datetime.now(UTC)
    ports = [port for port in parse_scan_ports(settings.scan_ports) if port != settings.port]

    async with httpx.AsyncClient(timeout=settings.request_timeout, follow_redirects=False, verify=False) as client:
        results = await asyncio.gather(
            *(probe_http_or_https(settings.host, port, settings.request_timeout, client=client) for port in ports)
        )

    services = [
        service_from_probe(settings, port, result, checked_at)
        for port, result in zip(ports, results, strict=True)
        if result is not None
    ]
    return checked_at, deduplicate_services(services)


async def scan_loop(settings: Settings, registry: ServiceRegistry) -> None:
    while True:
        scanned_at, services = await scan_services(settings)
        registry.replace(services, scanned_at)
        await asyncio.sleep(settings.scan_interval)


async def scan_once(settings: Settings, registry: ServiceRegistry) -> None:
    scanned_at, services = await scan_services(settings)
    registry.replace(services, scanned_at)
