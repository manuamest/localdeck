import httpx

from app.scanner.probe import probe_http


async def test_probe_http_returns_response_metadata() -> None:
    async def handler(request: httpx.Request) -> httpx.Response:
        assert str(request.url) == "http://localhost:8000"
        return httpx.Response(200, headers={"content-type": "text/html"}, text="<title>App</title>")

    transport = httpx.MockTransport(handler)
    async with httpx.AsyncClient(transport=transport) as client:
        result = await probe_http("localhost", 8000, timeout=2, client=client)

    assert result is not None
    assert result.url == "http://localhost:8000"
    assert result.status_code == 200
    assert result.content_type == "text/html"
    assert result.text == "<title>App</title>"
    assert result.response_time_ms >= 0


async def test_probe_http_returns_none_on_http_error() -> None:
    async def handler(request: httpx.Request) -> httpx.Response:
        raise httpx.ConnectError("connection failed", request=request)

    transport = httpx.MockTransport(handler)
    async with httpx.AsyncClient(transport=transport) as client:
        result = await probe_http("localhost", 8000, timeout=2, client=client)

    assert result is None


async def test_probe_http_follows_local_redirects() -> None:
    async def handler(request: httpx.Request) -> httpx.Response:
        if str(request.url) == "http://localhost:5050":
            return httpx.Response(302, headers={"location": "/login"})
        return httpx.Response(200, text="<title>pgAdmin</title>")

    transport = httpx.MockTransport(handler)
    async with httpx.AsyncClient(transport=transport) as client:
        result = await probe_http("localhost", 5050, timeout=2, client=client)

    assert result is not None
    assert result.status_code == 200
    assert result.text == "<title>pgAdmin</title>"


async def test_probe_http_does_not_follow_external_redirects() -> None:
    async def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(302, headers={"location": "http://example.com/login"})

    transport = httpx.MockTransport(handler)
    async with httpx.AsyncClient(transport=transport) as client:
        result = await probe_http("localhost", 5050, timeout=2, client=client)

    assert result is not None
    assert result.status_code == 302
