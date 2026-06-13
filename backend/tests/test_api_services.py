from fastapi.testclient import TestClient

from app.config import Settings
from app.main import app
from app.registry import ServiceRegistry


def test_services_returns_empty_snapshot() -> None:
    client = TestClient(app)

    response = client.get("/api/services")

    assert response.status_code == 200
    assert response.json() == {
        "scanned_at": None,
        "scan_interval": 10,
        "services": [],
    }


def test_scan_endpoint_updates_snapshot_for_empty_scan() -> None:
    original_settings = app.state.settings
    original_registry = app.state.registry
    try:
        app.state.settings = Settings(host="localhost", port=4888, scan_ports="")
        app.state.registry = ServiceRegistry(scan_interval=10)
        client = TestClient(app)

        response = client.post("/api/scan")

        assert response.status_code == 200
        body = response.json()
        assert body["scanned_at"] is not None
        assert body["scan_interval"] == 10
        assert body["services"] == []
    finally:
        app.state.settings = original_settings
        app.state.registry = original_registry


def test_scan_endpoint_keeps_api_available_when_scan_fails() -> None:
    original_settings = app.state.settings
    original_registry = app.state.registry
    try:
        app.state.settings = Settings(host="localhost", port=4888, scan_ports="bad-port")
        app.state.registry = ServiceRegistry(scan_interval=10)
        client = TestClient(app)

        response = client.post("/api/scan")

        assert response.status_code == 200
        assert response.json() == {
            "scanned_at": None,
            "scan_interval": 10,
            "services": [],
        }
    finally:
        app.state.settings = original_settings
        app.state.registry = original_registry
