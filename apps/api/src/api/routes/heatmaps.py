from fastapi import APIRouter

from src.persisted_state import list_altitude_heatmap_bins
from src.schemas.heatmap import HeatmapBin


router = APIRouter()


@router.get("/altitude", response_model=list[HeatmapBin])
def altitude() -> list[HeatmapBin]:
    return list_altitude_heatmap_bins()
