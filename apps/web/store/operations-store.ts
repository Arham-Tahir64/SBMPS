"use client";

import { create } from "zustand";

export type LayerVisibility = {
  objects: boolean;
  conjunctions: boolean;
  heatmap: boolean;
  orbit: boolean;
};

type OperationsState = {
  selectedObjectId?: string;
  selectedConjunctionId?: string;
  layerVisibility: LayerVisibility;
  selectObject: (objectId?: string) => void;
  selectConjunction: (conjunctionId?: string) => void;
  toggleLayer: (layer: keyof LayerVisibility) => void;
};

export const useOperationsStore = create<OperationsState>((set) => ({
  selectedObjectId: undefined,
  selectedConjunctionId: undefined,
  layerVisibility: {
    objects: true,
    conjunctions: true,
    heatmap: true,
    orbit: true
  },
  selectObject: (selectedObjectId) => set({ selectedObjectId }),
  selectConjunction: (selectedConjunctionId) => set({ selectedConjunctionId }),
  toggleLayer: (layer) =>
    set((state) => ({
      layerVisibility: {
        ...state.layerVisibility,
        [layer]: !state.layerVisibility[layer]
      }
    }))
}));
