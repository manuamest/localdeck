import pytest

from app.config import get_settings


@pytest.fixture(autouse=True)
def clear_settings_cache():
    get_settings.cache_clear()
    yield
    get_settings.cache_clear()


def test_get_settings_allows_default_host(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("LOCALDECK_HOST", raising=False)

    assert get_settings().host == "host.docker.internal"


def test_get_settings_default_ports_include_common_docker_ui_ports(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("LOCALDECK_SCAN_PORTS", raising=False)

    ports = set(get_settings().scan_ports.split(","))

    assert {"5050", "8000-8010", "8080-8084", "9443"}.issubset(ports)


def test_get_settings_allows_localhost(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("LOCALDECK_HOST", "localhost")

    assert get_settings().host == "localhost"


def test_get_settings_allows_private_ip(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("LOCALDECK_HOST", "192.168.1.10")

    assert get_settings().host == "192.168.1.10"


def test_get_settings_rejects_external_hostname(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("LOCALDECK_HOST", "example.com")

    with pytest.raises(ValueError, match="LOCALDECK_HOST must be local or private"):
        get_settings()


def test_get_settings_rejects_external_ip(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("LOCALDECK_HOST", "8.8.8.8")

    with pytest.raises(ValueError, match="LOCALDECK_HOST must be local or private"):
        get_settings()
