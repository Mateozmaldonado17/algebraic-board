"use client";

import { useState } from "react";
import { ChartIcon } from "@/components/icons/chart-icon";
import type { SelectionRect } from "@/types/selection";

type MarqueeSelectionLayerProps = {
  draftSelection: SelectionRect | null;
  committedSelection: SelectionRect | null;
  onDownload: () => Promise<void>;
};

export function MarqueeSelectionLayer({
  draftSelection,
  committedSelection,
  onDownload,
}: MarqueeSelectionLayerProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const activeSelection = draftSelection ?? committedSelection;
  const isDraft = draftSelection !== null;

  if (!activeSelection) {
    return null;
  }

  const handleDownload = async () => {
    if (isDraft || isDownloading) {
      return;
    }

    setIsDownloading(true);

    try {
      await onDownload();
    } finally {
      setIsDownloading(false);
    }
  };

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
          aria-label="Descargar selección"
          title="Descargar selección"
          onClick={handleDownload}
          onPointerDown={(event) => event.stopPropagation()}
          disabled={isDownloading}
        >
          <ChartIcon className="marquee-download-icon" />
        </button>
      ) : null}
    </>
  );
}
