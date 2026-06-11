from fastapi.testclient import TestClient

from app.main import app


def test_services_returns_empty_snapshot() -> None:
    client = TestClient(app)

    response = client.get("/api/services")

    assert response.status_code == 200
    assert response.json() == {
        "scanned_at": None,
        "scan_interval": 10,
        "services": [],
    }
