import { toCanvas } from "html-to-image";
import type { SelectionRect } from "@/types/selection";

const OVERLAY_SELECTOR =
  ".marquee-box, .marquee-download, .function-graph-widget";

function hideOverlays(boardElement: HTMLElement) {
  const overlays = boardElement.querySelectorAll(OVERLAY_SELECTOR);

  overlays.forEach((element) => {
    (element as HTMLElement).style.visibility = "hidden";
  });
}

function showOverlays(boardElement: HTMLElement) {
  const overlays = boardElement.querySelectorAll(OVERLAY_SELECTOR);

  overlays.forEach((element) => {
    (element as HTMLElement).style.visibility = "";
  });
}

export async function captureBoardSelectionAsDataUrl(
  boardElement: HTMLElement,
  selection: SelectionRect,
): Promise<string> {
  hideOverlays(boardElement);

  try {
    const canvas = await toCanvas(boardElement, {
      pixelRatio: window.devicePixelRatio,
      cacheBust: true,
    });

    const scale = canvas.width / boardElement.offsetWidth;
    const cropWidth = Math.max(1, Math.round(selection.width * scale));
    const cropHeight = Math.max(1, Math.round(selection.height * scale));

    const cropCanvas = document.createElement("canvas");
    cropCanvas.width = cropWidth;
    cropCanvas.height = cropHeight;

    const context = cropCanvas.getContext("2d");

    if (!context) {
      throw new Error("Could not create canvas context.");
    }

    context.drawImage(
      canvas,
      Math.round(selection.x * scale),
      Math.round(selection.y * scale),
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight,
    );

    return cropCanvas.toDataURL("image/png");
  } finally {
    showOverlays(boardElement);
  }
}
