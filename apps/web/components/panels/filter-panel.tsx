import type { FilterDefinition } from "@sdmps/api-client";
import { ShellSection } from "@sdmps/ui";

export function FilterPanel({ filters }: { filters: FilterDefinition[] }) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
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
    </div>
  );
}
