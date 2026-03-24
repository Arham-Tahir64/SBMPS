from fastapi import APIRouter

from src.api.routes import alerts, auth, conjunctions, dashboard, feeds, health, heatmaps, live, objects, simulations


api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(auth.router, prefix="/v1/auth", tags=["auth"])
api_router.include_router(live.router, prefix="/v1/live", tags=["live"])
api_router.include_router(objects.router, prefix="/v1/objects", tags=["objects"])
api_router.include_router(conjunctions.router, prefix="/v1/conjunctions", tags=["conjunctions"])
api_router.include_router(dashboard.router, prefix="/v1/dashboard", tags=["dashboard"])
api_router.include_router(heatmaps.router, prefix="/v1/heatmaps", tags=["heatmaps"])
api_router.include_router(feeds.router, prefix="/v1/feeds", tags=["feeds"])
api_router.include_router(simulations.router, prefix="/v1/simulations", tags=["simulations"])
api_router.include_router(alerts.router, prefix="/v1/alerts", tags=["alerts"])
