import pytest
from fastapi.testclient import TestClient

from app.main import app


def test_favicon_proxy_rejects_external_hosts() -> None:
    response = TestClient(app).get("/api/favicon", params={"url": "https://example.com/favicon.ico"})

    assert response.status_code == 400


def test_favicon_proxy_serves_local_images(monkeypatch: pytest.MonkeyPatch) -> None:
    class FakeAsyncClient:
        def __init__(self, **kwargs):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, traceback):
            return None

        async def get(self, url: str):
            from httpx import Request, Response

            return Response(200, headers={"content-type": "image/svg+xml"}, content=b"<svg></svg>", request=Request("GET", url))

    monkeypatch.setattr("app.api.favicon.httpx.AsyncClient", FakeAsyncClient)

    response = TestClient(app).get("/api/favicon", params={"url": "http://localhost:3000/favicon.svg"})

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("image/svg+xml")
    assert response.content == b"<svg></svg>"


def test_favicon_proxy_supports_head(monkeypatch: pytest.MonkeyPatch) -> None:
    class FakeAsyncClient:
        def __init__(self, **kwargs):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, traceback):
            return None

        async def get(self, url: str):
            from httpx import Request, Response

            return Response(200, headers={"content-type": "image/svg+xml"}, content=b"<svg></svg>", request=Request("GET", url))

    monkeypatch.setattr("app.api.favicon.httpx.AsyncClient", FakeAsyncClient)

    response = TestClient(app).head("/api/favicon", params={"url": "http://localhost:3000/favicon.svg"})

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("image/svg+xml")
