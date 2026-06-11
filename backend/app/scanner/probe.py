from dataclasses import dataclass
from time import perf_counter
from urllib.parse import urljoin, urlparse

import httpx

MAX_LOCAL_REDIRECTS = 3


@dataclass(frozen=True)
class HttpProbeResult:
    url: str
    status_code: int
    response_time_ms: int
    content_type: str | None
    text: str


async def probe_http(
    host: str,
    port: int,
    timeout: float,
    client: httpx.AsyncClient | None = None,
) -> HttpProbeResult | None:
    url = f"http://{host}:{port}"
    owns_client = client is None

    if client is None:
        client = httpx.AsyncClient(timeout=timeout, follow_redirects=False)

    started = perf_counter()
    try:
        response = await _get_with_local_redirects(client, url, host, port)
    except httpx.HTTPError:
        return None
    finally:
        if owns_client:
            await client.aclose()

    elapsed_ms = max(0, round((perf_counter() - started) * 1000))
    return HttpProbeResult(
        url=str(response.url),
        status_code=response.status_code,
        response_time_ms=elapsed_ms,
        content_type=response.headers.get("content-type"),
        text=response.text,
    )


async def _get_with_local_redirects(
    client: httpx.AsyncClient,
    url: str,
    host: str,
    port: int,
) -> httpx.Response:
    current_url = url

    for _ in range(MAX_LOCAL_REDIRECTS + 1):
        response = await client.get(current_url)
        location = response.headers.get("location")

        if response.status_code not in {301, 302, 303, 307, 308} or not location:
            return response

        next_url = urljoin(current_url, location)
        parsed = urlparse(next_url)
        next_port = parsed.port or (80 if parsed.scheme == "http" else 443)

        if parsed.scheme != "http" or parsed.hostname != host or next_port != port:
            return response

        current_url = next_url

    return response
