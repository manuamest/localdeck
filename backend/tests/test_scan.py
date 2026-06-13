from datetime import UTC, datetime

from app.config import Settings
from app.registry import ServiceRegistry
from app.scanner.probe import HttpProbeResult
from app.scanner.docker import DockerServiceMetadata
from app.scanner.scan import proxied_favicon_url, scan_once, service_from_probe


def test_service_from_probe_builds_service_record_with_title_and_favicon() -> None:
    settings = Settings(host="host.docker.internal", port=4888, scan_ports="8000")
    checked_at = datetime(2026, 6, 11, 12, 0, tzinfo=UTC)
    result = HttpProbeResult(
        url="http://host.docker.internal:8000",
        protocol="http",
        status_code=200,
        response_time_ms=25,
        content_type="text/html",
        text='<html><head><title>Demo App</title><link rel="icon" href="/icon.png"></head></html>',
    )

    service = service_from_probe(settings, 8000, result, checked_at)

    assert service.id == "http-host.docker.internal-8000"
    assert service.title == "Demo App"
    assert service.url == "http://host.docker.internal:8000"
    assert service.display_url == "http://localhost:8000"
    assert service.host == "host.docker.internal"
    assert service.port == 8000
    assert service.protocol == "http"
    assert service.status_code == 200
    assert service.response_time_ms == 25
    assert service.favicon_url == "/api/favicon?url=http%3A%2F%2Fhost.docker.internal%3A8000%2Ficon.png"
    assert service.runtime_hint == "python"
    assert service.framework_hint == "unknown"
    assert service.source == "http_probe"
    assert service.last_seen == checked_at
    assert service.last_checked == checked_at
    assert service.error is None


def test_service_from_probe_uses_port_fallback_title() -> None:
    settings = Settings(host="localhost", port=4888, scan_ports="8000")
    checked_at = datetime(2026, 6, 11, 12, 0, tzinfo=UTC)
    result = HttpProbeResult(
        url="http://localhost:8000",
        protocol="http",
        status_code=404,
        response_time_ms=5,
        content_type="text/html",
        text="<html></html>",
    )

    service = service_from_probe(settings, 8000, result, checked_at)

    assert service.title == "Service on port 8000"
    assert service.favicon_url == "/api/favicon?url=http%3A%2F%2Flocalhost%3A8000%2Ffavicon.ico"


def test_service_from_probe_ignores_redirecting_title() -> None:
    settings = Settings(host="localhost", port=4888, scan_ports="5050")
    checked_at = datetime(2026, 6, 11, 12, 0, tzinfo=UTC)
    result = HttpProbeResult(
        url="http://localhost:5050",
        protocol="http",
        status_code=302,
        response_time_ms=5,
        content_type="text/html",
        text="<title>Redirecting...</title>",
    )

    service = service_from_probe(settings, 5050, result, checked_at)

    assert service.title == "Service on port 5050"


def test_service_from_probe_builds_https_service_record() -> None:
    settings = Settings(host="host.docker.internal", port=4888, scan_ports="9443")
    checked_at = datetime(2026, 6, 11, 12, 0, tzinfo=UTC)
    result = HttpProbeResult(
        url="https://host.docker.internal:9443",
        protocol="https",
        status_code=200,
        response_time_ms=25,
        content_type="text/html",
        text="<title>Secure App</title>",
    )

    service = service_from_probe(settings, 9443, result, checked_at)

    assert service.id == "https-host.docker.internal-9443"
    assert service.url == "https://host.docker.internal:9443"
    assert service.display_url == "https://localhost:9443"
    assert service.protocol == "https"


async def test_scan_once_preserves_snapshot_when_scan_fails() -> None:
    registry = ServiceRegistry(scan_interval=10)
    settings = Settings(host="localhost", port=4888, scan_ports="bad-port")

    success = await scan_once(settings, registry)

    assert success is False
    assert registry.snapshot().scanned_at is None
    assert registry.snapshot().services == []


def test_proxied_favicon_url_keeps_data_urls() -> None:
    favicon_url = "data:image/gif;base64,abc"

    assert proxied_favicon_url(favicon_url) == favicon_url


def test_service_from_probe_marks_docker_source_when_metadata_exists() -> None:
    settings = Settings(host="host.docker.internal", port=4888, scan_ports="9000")
    checked_at = datetime(2026, 6, 11, 12, 0, tzinfo=UTC)
    result = HttpProbeResult(
        url="http://host.docker.internal:9000",
        protocol="http",
        status_code=200,
        response_time_ms=25,
        content_type="text/html",
        text="<title>Portainer</title>",
    )
    docker_metadata = DockerServiceMetadata(
        port=9000,
        container_name="portainer",
        image="portainer/portainer-ce:latest",
        compose_project="tools",
        compose_service="portainer",
        evidence=["Docker container portainer", "Compose service portainer"],
    )

    service = service_from_probe(settings, 9000, result, checked_at, docker_metadata)

    assert service.source == "docker"
    assert service.runtime_hint == "docker"
    assert service.framework_hint == "portainer"
    assert service.confidence == 1.0
    assert "Docker container portainer" in service.evidence
