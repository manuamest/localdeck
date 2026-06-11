from fastapi import APIRouter, Request

from app.models import ServicesResponse

router = APIRouter(prefix="/api")


@router.get("/services", response_model=ServicesResponse)
async def services(request: Request) -> ServicesResponse:
    return request.app.state.registry.snapshot()
