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


def _get_int(name: str, default: int) -> int:
    value = os.getenv(name)
    if value is None or value == "":
        return default
    return int(value)


def _get_float(name: str, default: float) -> float:
    value = os.getenv(name)
    if value is None or value == "":
        return default
    return float(value)


def _get_host() -> str:
    host = os.getenv("LOCALDECK_HOST", "host.docker.internal")
    if host in ALLOWED_LOCAL_HOSTNAMES:
        return host

    try:
        parsed = ip_address(host)
    except ValueError as error:
        raise ValueError(f"LOCALDECK_HOST must be local or private: {host}") from error

    if parsed.is_loopback or parsed.is_private or parsed.is_link_local:
        return host

    raise ValueError(f"LOCALDECK_HOST must be local or private: {host}")


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings(
        host=_get_host(),
        port=_get_int("LOCALDECK_PORT", 4888),
        scan_ports=os.getenv("LOCALDECK_SCAN_PORTS", DEFAULT_SCAN_PORTS),
        scan_interval=_get_int("LOCALDECK_SCAN_INTERVAL", 10),
        request_timeout=_get_float("LOCALDECK_REQUEST_TIMEOUT", 2.0),
    )
