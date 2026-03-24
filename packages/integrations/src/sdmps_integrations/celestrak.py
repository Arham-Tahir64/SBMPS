from __future__ import annotations

from urllib.request import Request, urlopen


class CelesTrakClient:
    def __init__(self, base_url: str):
        self.base_url = base_url

    def fetch_active_tles(self, timeout_seconds: int) -> str:
        request = Request(self.base_url, headers={"User-Agent": "SDMPS/0.1"})
        with urlopen(request, timeout=timeout_seconds) as response:
            return response.read().decode("utf-8")
