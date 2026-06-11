from fastapi import APIRouter, Request

from app.models import ServicesResponse
from app.scanner.scan import scan_once

router = APIRouter(prefix="/api")


@router.get("/services", response_model=ServicesResponse)
async def services(request: Request) -> ServicesResponse:
    return request.app.state.registry.snapshot()


@router.post("/scan", response_model=ServicesResponse)
async def scan(request: Request) -> ServicesResponse:
    await scan_once(request.app.state.settings, request.app.state.registry)
    return request.app.state.registry.snapshot()
