import asyncio
from contextlib import asynccontextmanager
from contextlib import suppress

from fastapi import FastAPI

from app.api.health import router as health_router
from app.api.services import router as services_router
from app.config import get_settings
from app.registry import ServiceRegistry
from app.scanner.scan import scan_loop


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.scan_task = asyncio.create_task(scan_loop(app.state.settings, app.state.registry))
    try:
        yield
    finally:
        app.state.scan_task.cancel()
        with suppress(asyncio.CancelledError):
            await app.state.scan_task


app = FastAPI(title="Localdeck", version="0.1.0", lifespan=lifespan)
app.state.settings = get_settings()
app.state.registry = ServiceRegistry(scan_interval=app.state.settings.scan_interval)

app.include_router(health_router)
app.include_router(services_router)
