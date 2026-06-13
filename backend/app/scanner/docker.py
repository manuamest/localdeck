import logging
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import httpx

from app.config import Settings

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class DockerServiceMetadata:
    port: int
    container_name: str | None = None
    image: str | None = None
    compose_project: str | None = None
    compose_service: str | None = None
    evidence: list[str] = field(default_factory=list)


async def inspect_docker_services(settings: Settings) -> dict[int, DockerServiceMetadata]:
    socket_path = Path(settings.docker_socket)
    if not socket_path.exists():
        return {}

    try:
        transport = httpx.AsyncHTTPTransport(uds=str(socket_path))
        async with httpx.AsyncClient(transport=transport, base_url="http://docker", timeout=settings.request_timeout) as client:
            response = await client.get("/containers/json")
            response.raise_for_status()
    except Exception:
        logger.exception("Docker metadata inspection failed")
        return {}

    return docker_metadata_by_port(response.json())


def docker_metadata_by_port(containers: list[dict[str, Any]]) -> dict[int, DockerServiceMetadata]:
    metadata: dict[int, DockerServiceMetadata] = {}

    for container in containers:
        labels = container.get("Labels") or {}
        image = _string_or_none(container.get("Image"))
        name = _container_name(container.get("Names"))
        compose_project = _string_or_none(labels.get("com.docker.compose.project"))
        compose_service = _string_or_none(labels.get("com.docker.compose.service"))

        for port in container.get("Ports") or []:
            if port.get("Type") != "tcp" or "PublicPort" not in port:
                continue

            public_port = int(port["PublicPort"])
            evidence = [f"Docker container {name or container.get('Id', 'unknown')}"]
            if compose_project:
                evidence.append(f"Compose project {compose_project}")
            if compose_service:
                evidence.append(f"Compose service {compose_service}")

            metadata[public_port] = DockerServiceMetadata(
                port=public_port,
                container_name=name,
                image=image,
                compose_project=compose_project,
                compose_service=compose_service,
                evidence=evidence,
            )

    return metadata


def _container_name(names: Any) -> str | None:
    if not isinstance(names, list) or not names:
        return None

    value = str(names[0]).strip("/")
    return value or None


def _string_or_none(value: Any) -> str | None:
    if value is None:
        return None

    text = str(value).strip()
    return text or None
