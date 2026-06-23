import os
from dataclasses import dataclass
from functools import lru_cache
from ipaddress import ip_address


DEFAULT_SCAN_PORTS = (
    "3000,3001,4173,4200,5000,5050,5173,5500,6274,7000,7860,"
    "8000-8010,8080-8084,8888,9000,9443,11434"
)

ALLOWED_LOCAL_HOSTNAMES = {"localhost", "host.docker.internal"}


@dataclass(frozen=True)
class Settings:
    host: str = "host.docker.internal"
    port: int = 4888
    scan_ports: str = DEFAULT_SCAN_PORTS
    scan_interval: int = 10
    request_timeout: float = 2.0
    docker_socket: str = "/var/run/docker.sock"


def _get_host() -> str:
    host = os.getenv("LOCALDECK_HOST", "host.docker.internal")
    if is_allowed_local_host(host):
        return host

    raise ValueError(f"LOCALDECK_HOST must be local or private: {host}")


def is_allowed_local_host(host: str) -> bool:
    if host in ALLOWED_LOCAL_HOSTNAMES:
        return True

    try:
        parsed = ip_address(host)
    except ValueError:
        return False

    if parsed.is_loopback or parsed.is_private or parsed.is_link_local:
        return True

    return False


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings(
        host=_get_host(),
        port=int(os.getenv("LOCALDECK_PORT") or 4888),
        scan_ports=os.getenv("LOCALDECK_SCAN_PORTS", DEFAULT_SCAN_PORTS),
        scan_interval=int(os.getenv("LOCALDECK_SCAN_INTERVAL") or 10),
        request_timeout=float(os.getenv("LOCALDECK_REQUEST_TIMEOUT") or 2.0),
        docker_socket=os.getenv("LOCALDECK_DOCKER_SOCKET", "/var/run/docker.sock"),
    )
