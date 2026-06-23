from urllib.parse import unquote, urlparse

import httpx
from fastapi import APIRouter, HTTPException, Request, Response

from app.config import is_allowed_local_host

router = APIRouter(prefix="/api")

MAX_FAVICON_BYTES = 1_000_000


@router.get("/favicon")
@router.head("/favicon")
async def favicon(url: str, request: Request) -> Response:
    target_url = unquote(url)
    parsed = urlparse(target_url)

    if parsed.scheme not in {"http", "https"} or not parsed.hostname or not is_allowed_local_host(parsed.hostname):
        raise HTTPException(status_code=400, detail="Favicon URL must be local")

    try:
        async with httpx.AsyncClient(
            timeout=request.app.state.settings.request_timeout,
            follow_redirects=True,
            max_redirects=3,
            verify=False,
        ) as client:
            upstream = await client.get(target_url)
    except httpx.HTTPError as error:
        raise HTTPException(status_code=404, detail="Favicon unavailable") from error

    final_host = urlparse(str(upstream.url)).hostname or ""
    if not is_allowed_local_host(final_host):
        raise HTTPException(status_code=400, detail="Favicon URL must be local")

    content_type = upstream.headers.get("content-type", "")
    if upstream.status_code >= 400 or not content_type.startswith("image/"):
        raise HTTPException(status_code=404, detail="Favicon unavailable")

    content = upstream.content
    if len(content) > MAX_FAVICON_BYTES:
        raise HTTPException(status_code=413, detail="Favicon too large")

    return Response(
        content=content,
        media_type=content_type.split(";", maxsplit=1)[0],
        headers={"Cache-Control": "public, max-age=300"},
    )
