import httpx

from app.scanner.probe import probe_http, probe_http_or_https, probe_https


async def test_probe_http_returns_response_metadata() -> None:
    async def handler(request: httpx.Request) -> httpx.Response:
        assert str(request.url) == "http://localhost:8000"
        return httpx.Response(200, headers={"content-type": "text/html"}, text="<title>App</title>")

    transport = httpx.MockTransport(handler)
    async with httpx.AsyncClient(transport=transport) as client:
        result = await probe_http("localhost", 8000, timeout=2, client=client)

    assert result is not None
    assert result.url == "http://localhost:8000"
    assert result.protocol == "http"
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


async def test_probe_https_returns_response_metadata() -> None:
    async def handler(request: httpx.Request) -> httpx.Response:
        assert str(request.url) == "https://localhost:9443"
        return httpx.Response(200, headers={"content-type": "text/html"}, text="<title>Secure App</title>")

    transport = httpx.MockTransport(handler)
    async with httpx.AsyncClient(transport=transport) as client:
        result = await probe_https("localhost", 9443, timeout=2, client=client)

    assert result is not None
    assert result.url == "https://localhost:9443"
    assert result.protocol == "https"
    assert result.status_code == 200
    assert result.text == "<title>Secure App</title>"


async def test_probe_http_or_https_tries_https_when_http_fails() -> None:
    async def handler(request: httpx.Request) -> httpx.Response:
        if request.url.scheme == "http":
            raise httpx.ConnectError("connection failed", request=request)
        return httpx.Response(200, text="<title>Secure App</title>")

    transport = httpx.MockTransport(handler)
    async with httpx.AsyncClient(transport=transport) as client:
        result = await probe_http_or_https("localhost", 9443, timeout=2, client=client)

    assert result is not None
    assert result.protocol == "https"
    assert result.status_code == 200


async def test_probe_http_or_https_prefers_http_when_it_responds() -> None:
    async def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, text=f"<title>{request.url.scheme}</title>")

    transport = httpx.MockTransport(handler)
    async with httpx.AsyncClient(transport=transport) as client:
        result = await probe_http_or_https("localhost", 9000, timeout=2, client=client)

    assert result is not None
    assert result.protocol == "http"


async def test_probe_http_or_https_tries_https_when_http_reports_tls_required() -> None:
    async def handler(request: httpx.Request) -> httpx.Response:
        if request.url.scheme == "http":
            return httpx.Response(400, text="Client sent an HTTP request to an HTTPS server.")
        return httpx.Response(200, text="<title>Portainer</title>")

    transport = httpx.MockTransport(handler)
    async with httpx.AsyncClient(transport=transport) as client:
        result = await probe_http_or_https("localhost", 9443, timeout=2, client=client)

    assert result is not None
    assert result.protocol == "https"
    assert result.status_code == 200
    assert result.text == "<title>Portainer</title>"


async def test_probe_https_does_not_follow_http_redirects() -> None:
    async def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(302, headers={"location": "http://localhost:9443/login"})

    transport = httpx.MockTransport(handler)
    async with httpx.AsyncClient(transport=transport) as client:
        result = await probe_https("localhost", 9443, timeout=2, client=client)

    assert result is not None
    assert result.status_code == 302
