import asyncio
from contextlib import asynccontextmanager
from contextlib import suppress
from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles

from app.api.health import router as health_router
from app.api.services import router as services_router
from app.config import get_settings
from app.registry import ServiceRegistry
from app.scanner.scan import scan_loop

PROJECT_ROOT = Path(__file__).resolve().parents[2]
FRONTEND_DIST = PROJECT_ROOT / "frontend" / "dist"


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.scan_task = asyncio.create_task(scan_loop(app.state.settings, app.state.registry))
    try:
        yield
    finally:
        app.state.scan_task.cancel()
        with suppress(asyncio.CancelledError):
            await app.state.scan_task


app = FastAPI(title="Localdeck", version="0.3.0", lifespan=lifespan)
app.state.settings = get_settings()
app.state.registry = ServiceRegistry(scan_interval=app.state.settings.scan_interval)

app.include_router(health_router)
app.include_router(services_router)


def register_frontend(app: FastAPI, dist_dir: Path = FRONTEND_DIST) -> None:
    index_file = dist_dir / "index.html"
    assets_dir = dist_dir / "assets"

    if not index_file.exists():
        return

    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/", response_class=HTMLResponse)
    async def frontend_index() -> str:
        return index_file.read_text(encoding="utf-8")

    @app.get("/favicon.svg")
    @app.head("/favicon.svg")
    async def frontend_favicon() -> FileResponse:
        return FileResponse(
            dist_dir / "favicon.svg",
            media_type="image/svg+xml",
            headers={"Cache-Control": "no-cache"},
        )

    @app.get("/{path:path}", response_class=HTMLResponse)
    async def frontend_fallback(path: str) -> str:
        return index_file.read_text(encoding="utf-8")


register_frontend(app)
