import { captureBoardSelectionAsDataUrl } from "@/lib/capture-board-selection";
import type { SelectionRect } from "@/types/selection";

export async function downloadBoardSelection(
  boardElement: HTMLElement,
  selection: SelectionRect,
) {
  const dataUrl = await captureBoardSelectionAsDataUrl(boardElement, selection);
  const link = document.createElement("a");
  link.download = "algebraic-board-selection.png";
  link.href = dataUrl;
  link.click();
}
