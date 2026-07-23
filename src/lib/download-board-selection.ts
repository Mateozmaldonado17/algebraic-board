import { toCanvas } from "html-to-image";
import type { SelectionRect } from "@/types/selection";

export async function downloadBoardSelection(
  boardElement: HTMLElement,
  selection: SelectionRect,
) {
  const overlays = boardElement.querySelectorAll(
    ".marquee-box, .marquee-download",
  );

  overlays.forEach((element) => {
    (element as HTMLElement).style.visibility = "hidden";
  });

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

    const link = document.createElement("a");
    link.download = "algebraic-board-selection.png";
    link.href = cropCanvas.toDataURL("image/png");
    link.click();
  } finally {
    overlays.forEach((element) => {
      (element as HTMLElement).style.visibility = "";
    });
  }
}
