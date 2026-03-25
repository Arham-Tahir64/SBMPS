"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StateNotice } from "@sdmps/ui";
import { useCreateSimulation } from "../../../lib/queries/use-create-simulation";

type SelectFieldProps = {
  label: string;
  value: number;
  options: { value: number; label: string }[];
  onChange: (v: number) => void;
};

function SelectField({ label, value, options, onChange }: SelectFieldProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
        {label}
      </label>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              border: `1px solid ${value === opt.value ? "rgba(121,178,255,0.5)" : "rgba(121,178,255,0.14)"}`,
              background: value === opt.value ? "rgba(121,178,255,0.12)" : "transparent",
              color: value === opt.value ? "var(--accent)" : "var(--muted)",
              fontSize: 13,
              fontWeight: value === opt.value ? 600 : 400,
              cursor: "pointer",
              transition: "all 0.12s",
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function NewSimulationClient() {
  const router = useRouter();
  const { mutate, isPending, error } = useCreateSimulation();

  const [scenarioName, setScenarioName] = useState("");
  const [durationDays, setDurationDays] = useState(7);
  const [objectSampleSize, setObjectSampleSize] = useState(500);
  const [stepHours, setStepHours] = useState(6);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scenarioName.trim()) return;

    mutate(
      { scenarioName: scenarioName.trim(), durationDays, objectSampleSize, stepHours },
      { onSuccess: () => router.push("/simulations") }
    );
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 20, maxWidth: 560 }}>
      {/* Scenario name */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label
          htmlFor="scenario-name"
          style={{ fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}
        >
          Scenario Name
        </label>
        <input
          id="scenario-name"
          type="text"
          value={scenarioName}
          onChange={(e) => setScenarioName(e.target.value)}
          placeholder="e.g. LEO baseline 30-day scan"
          required
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid rgba(121,178,255,0.2)",
            background: "rgba(255,255,255,0.03)",
            color: "var(--foreground)",
            fontSize: 14,
            outline: "none",
          }}
        />
      </div>

      <SelectField
        label="Duration"
        value={durationDays}
        onChange={setDurationDays}
        options={[
          { value: 1,  label: "1 day" },
          { value: 3,  label: "3 days" },
          { value: 7,  label: "7 days" },
          { value: 14, label: "14 days" },
          { value: 30, label: "30 days" },
        ]}
      />

      <SelectField
        label="Object Sample Size"
        value={objectSampleSize}
        onChange={setObjectSampleSize}
        options={[
          { value: 100,  label: "100" },
          { value: 500,  label: "500" },
          { value: 1000, label: "1,000" },
          { value: 2000, label: "2,000" },
        ]}
      />

      <SelectField
        label="Time Step"
        value={stepHours}
        onChange={setStepHours}
        options={[
          { value: 1,  label: "1h" },
          { value: 3,  label: "3h" },
          { value: 6,  label: "6h" },
          { value: 12, label: "12h" },
          { value: 24, label: "24h" },
        ]}
      />

      {error ? (
        <StateNotice title="Error" tone="warning">
          Failed to submit simulation job. Check that the API is reachable.
        </StateNotice>
      ) : null}

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button
          type="submit"
          disabled={isPending || !scenarioName.trim()}
          style={{
            padding: "10px 24px",
            borderRadius: 8,
            border: "none",
            background: isPending || !scenarioName.trim() ? "rgba(121,178,255,0.12)" : "rgba(121,178,255,0.22)",
            color: isPending || !scenarioName.trim() ? "var(--muted)" : "var(--accent)",
            fontWeight: 600,
            fontSize: 14,
            cursor: isPending || !scenarioName.trim() ? "not-allowed" : "pointer",
            transition: "all 0.12s",
          }}
        >
          {isPending ? "Submitting…" : "Queue Simulation"}
        </button>
        <a
          href="/simulations"
          style={{ fontSize: 13, color: "var(--muted)", textDecoration: "none" }}
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
