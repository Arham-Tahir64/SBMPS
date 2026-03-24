import type { FilterDefinition } from "@sdmps/api-client";
import type { LayerVisibility } from "../../store/operations-store";
import { ShellSection } from "@sdmps/ui";

type FilterPanelProps = {
  filters: FilterDefinition[];
  layerVisibility: LayerVisibility;
  toggleLayer: (layer: keyof LayerVisibility) => void;
  feedSummary: string;
  isFallback: boolean;
};

export function FilterPanel({
  filters,
  layerVisibility,
  toggleLayer,
  feedSummary,
  isFallback
}: FilterPanelProps) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <ShellSection title="Data Source">
        <div>{isFallback ? "Fallback placeholder data" : "Live API data"}</div>
        <div style={{ color: "var(--muted)", marginTop: 6 }}>{feedSummary}</div>
      </ShellSection>
      {filters.map((filter) => (
        <ShellSection key={filter.id} title={filter.label}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {filter.options.map((option) => (
              <span
                key={option}
                style={{
                  border: "1px solid rgba(121, 178, 255, 0.22)",
                  borderRadius: 999,
                  padding: "6px 10px",
                  color: "var(--muted)"
                }}
              >
                {option}
              </span>
            ))}
          </div>
        </ShellSection>
      ))}
      <ShellSection title="Layers">
        <div style={{ display: "grid", gap: 8 }}>
          {Object.entries(layerVisibility).map(([layer, visible]) => (
            <button
              key={layer}
              type="button"
              onClick={() => toggleLayer(layer as keyof LayerVisibility)}
              style={{
                textAlign: "left",
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(121, 178, 255, 0.22)",
                background: visible ? "rgba(83, 194, 255, 0.12)" : "transparent",
                color: "var(--text)",
                cursor: "pointer"
              }}
            >
              {layer}: {visible ? "on" : "off"}
            </button>
          ))}
        </div>
      </ShellSection>
    </div>
  );
}
