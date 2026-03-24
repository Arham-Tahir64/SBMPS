import type { RiskTier } from "@sdmps/domain";

export const DEFAULT_CAMERA_POSITION: [number, number, number] = [0, 0, 7];

export function toScenePosition(positionKm: [number, number, number]): [number, number, number] {
  return positionKm.map((value) => value / 3400) as [number, number, number];
}

export function riskTierColor(riskTier: RiskTier): string {
  switch (riskTier) {
    case "critical":
      return "#ff4d4d";
    case "high":
      return "#ff9d42";
    case "medium":
      return "#f7d154";
    case "low":
    default:
      return "#4ed4a8";
  }
}

export function objectClassColor(objectClass: string): string {
  switch (objectClass) {
    case "active-satellite":
      return "#53c2ff";
    case "rocket-body":
      return "#ff9d42";
    case "debris-fragment":
    default:
      return "#c084fc";
  }
}

export type PlaybackClock = {
  speed: number;
  paused: boolean;
};

export function createPlaybackClock(): PlaybackClock {
  return {
    speed: 1,
    paused: false
  };
}
