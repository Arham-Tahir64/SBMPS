from dataclasses import dataclass


@dataclass
class ManeuverOption:
    burn_type: str
    delta_v_mps: float
