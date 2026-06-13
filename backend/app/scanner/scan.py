import asyncio
import logging
from datetime import UTC, datetime
from urllib.parse import quote, urlparse

import httpx

from app.config import Settings
from app.models import ServiceRecord
from app.registry import ServiceRegistry
from app.scanner.classify import classify_service
from app.scanner.docker import DockerServiceMetadata, inspect_docker_services
from app.scanner.html import extract_favicon_url, extract_title
from app.scanner.ports import parse_scan_ports
from app.scanner.probe import HttpProbeResult, probe_http_or_https

logger = logging.getLogger(__name__)


def service_from_probe(
    settings: Settings,
    port: int,
    result: HttpProbeResult,
    checked_at: datetime,
    docker_metadata: DockerServiceMetadata | None = None,
) -> ServiceRecord:
    title = extract_title(result.text)
    if title in {None, "Redirecting...", "Redirecting"}:
        title = f"Service on port {port}"

    display_url = f"{result.protocol}://localhost:{port}"
    favicon_url = proxied_favicon_url(extract_favicon_url(result.text, result.url))
    classification = classify_service(title, port, docker_metadata.image if docker_metadata else None)
    evidence = [*classification.evidence]

    if docker_metadata:
        evidence.extend(docker_metadata.evidence)

    return ServiceRecord(
        id=f"{result.protocol}-{settings.host}-{port}",
        title=title,
        url=result.url,
        display_url=display_url,
        host=settings.host,
        port=port,
        protocol=result.protocol,
        status_code=result.status_code,
        response_time_ms=result.response_time_ms,
        favicon_url=favicon_url,
        source="docker" if docker_metadata else "http_probe",
        runtime_hint=classification.runtime_hint,
        framework_hint=classification.framework_hint,
        confidence=min(1.0, classification.confidence + (0.1 if docker_metadata else 0)),
        evidence=evidence,
        last_seen=checked_at,
        last_checked=checked_at,
        error=None,
    )


def proxied_favicon_url(favicon_url: str) -> str:
    parsed = urlparse(favicon_url)
    if parsed.scheme not in {"http", "https"}:
        return favicon_url

    return f"/api/favicon?url={quote(favicon_url, safe='')}"


async def scan_services(settings: Settings) -> tuple[datetime, list[ServiceRecord]]:
    checked_at = datetime.now(UTC)
    ports = [port for port in parse_scan_ports(settings.scan_ports) if port != settings.port]
    docker_metadata = await inspect_docker_services(settings)

    async with httpx.AsyncClient(timeout=settings.request_timeout, follow_redirects=False, verify=False) as client:
        results = await asyncio.gather(
            *(probe_http_or_https(settings.host, port, settings.request_timeout, client=client) for port in ports)
        )

    services = [
        service_from_probe(settings, port, result, checked_at, docker_metadata.get(port))
        for port, result in zip(ports, results, strict=True)
        if result is not None
    ]
    return checked_at, services


async def scan_loop(settings: Settings, registry: ServiceRegistry) -> None:
    while True:
        await scan_once(settings, registry)
        await asyncio.sleep(settings.scan_interval)


async def scan_once(settings: Settings, registry: ServiceRegistry) -> bool:
    try:
        scanned_at, services = await scan_services(settings)
    except Exception:
        logger.exception("Localdeck scan failed")
        return False

    registry.replace(services, scanned_at)
    return True
