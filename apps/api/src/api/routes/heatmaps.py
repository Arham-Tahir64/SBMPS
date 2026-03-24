from fastapi import APIRouter

from src.schemas.heatmap import HeatmapBin


router = APIRouter()


@router.get("/altitude", response_model=list[HeatmapBin])
def altitude() -> list[HeatmapBin]:
    return [
        HeatmapBin(bandStartKm=300, bandEndKm=400, density=0.18, riskConcentration=0.08),
        HeatmapBin(bandStartKm=400, bandEndKm=500, density=0.35, riskConcentration=0.14),
    ]
