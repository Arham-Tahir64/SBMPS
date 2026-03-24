from pydantic import BaseModel


class HeatmapBin(BaseModel):
    bandStartKm: int
    bandEndKm: int
    density: float
    riskConcentration: float
