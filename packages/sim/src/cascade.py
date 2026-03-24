from dataclasses import dataclass


@dataclass
class CascadeResult:
    fragment_count: int
    affected_bands: list[int]
