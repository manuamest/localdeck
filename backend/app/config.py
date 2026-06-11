import os
from dataclasses import dataclass
from functools import lru_cache


DEFAULT_SCAN_PORTS = (
    "3000,3001,4173,4200,5000,5173,5500,6274,7000,7860,"
    "8000,8001,8080,8888,9000,11434"
)


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


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings(
        host=os.getenv("LOCALDECK_HOST", "host.docker.internal"),
        port=_get_int("LOCALDECK_PORT", 4888),
        scan_ports=os.getenv("LOCALDECK_SCAN_PORTS", DEFAULT_SCAN_PORTS),
        scan_interval=_get_int("LOCALDECK_SCAN_INTERVAL", 10),
        request_timeout=_get_float("LOCALDECK_REQUEST_TIMEOUT", 2.0),
    )
