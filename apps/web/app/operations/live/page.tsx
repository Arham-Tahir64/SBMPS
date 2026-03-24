import { sampleConjunctions, sampleFilters, sampleObjects } from "@sdmps/api-client";
import { AlertInbox } from "../../../components/alerts/alert-inbox";
import { GlobeViewport } from "../../../components/globe/globe-viewport";
import { OperatorShell } from "../../../components/layout/operator-shell";
import { ConjunctionInspector } from "../../../components/panels/conjunction-inspector";
import { FilterPanel } from "../../../components/panels/filter-panel";
import { ObjectInspector } from "../../../components/panels/object-inspector";

export const metadata = {
  title: "Live Operations | SDMPS",
  description: "Real-time orbital operations console for tracked objects and conjunctions."
};

export default function OperationsLivePage() {
  const primaryObject = sampleObjects[0];
  const primaryConjunction = sampleConjunctions[0];

  return (
    <OperatorShell
      title="Live Operations"
      subtitle="Current orbital picture, conjunction watchlist, and operator drill-down"
      leftPanel={<FilterPanel filters={sampleFilters} />}
      centerPanel={
        <GlobeViewport
          objects={sampleObjects}
          conjunctions={sampleConjunctions}
          selectedObjectId={primaryObject.id}
        />
      }
      rightPanel={
        <div style={{ display: "grid", gap: 16 }}>
          <ObjectInspector object={primaryObject} />
          <ConjunctionInspector conjunction={primaryConjunction} />
        </div>
      }
      bottomPanel={<AlertInbox alerts={primaryConjunction ? [primaryConjunction] : []} />}
    />
  );
}
