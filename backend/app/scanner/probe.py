from dataclasses import dataclass
from time import perf_counter

import httpx


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
        response = await client.get(url)
    except httpx.HTTPError:
        return None
    finally:
        if owns_client:
            await client.aclose()

    elapsed_ms = max(0, round((perf_counter() - started) * 1000))
    return HttpProbeResult(
        url=url,
        status_code=response.status_code,
        response_time_ms=elapsed_ms,
        content_type=response.headers.get("content-type"),
        text=response.text,
    )
