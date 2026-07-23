"use client";

import { ChartIcon } from "@/components/icons/chart-icon";
import type { SelectionRect } from "@/types/selection";

type MarqueeSelectionLayerProps = {
  draftSelection: SelectionRect | null;
  committedSelection: SelectionRect | null;
  isProcessing?: boolean;
  onShowGraph: () => void;
};

export function MarqueeSelectionLayer({
  draftSelection,
  committedSelection,
  isProcessing = false,
  onShowGraph,
}: MarqueeSelectionLayerProps) {
  const activeSelection = draftSelection ?? committedSelection;
  const isDraft = draftSelection !== null;

  if (!activeSelection) {
    return null;
  }

  return (
    <>
      <div
        className={`marquee-box${isDraft ? " marquee-box--draft" : ""}`}
        style={{
          left: activeSelection.x,
          top: activeSelection.y,
          width: activeSelection.width,
          height: activeSelection.height,
        }}
      />

      {!isDraft && committedSelection ? (
        <button
          type="button"
          className="marquee-download"
          style={{
            left: committedSelection.x + committedSelection.width / 2,
            top: committedSelection.y + committedSelection.height + 10,
          }}
          aria-label="Mostrar gráfica"
          title="Mostrar gráfica"
          onClick={onShowGraph}
          onPointerDown={(event) => event.stopPropagation()}
          disabled={isProcessing}
        >
          <ChartIcon className="marquee-download-icon" />
        </button>
      ) : null}
    </>
  );
}
