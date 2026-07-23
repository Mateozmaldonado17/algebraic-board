import type { FunctionPlotExample } from "@/lib/function-plot-examples";
import { functionPlotExamples } from "@/lib/function-plot-examples";
import type { SelectionRect } from "@/types/selection";

export type GraphWidgetState = {
  id: string;
  example: FunctionPlotExample;
  x: number;
  y: number;
  width: number;
  height: number;
};

export function pickRandomFunctionPlotExample(): FunctionPlotExample {
  const index = Math.floor(Math.random() * functionPlotExamples.length);

  return functionPlotExamples[index];
}

export const GRAPH_WIDGET_MIN_SIZE = 220;
export const GRAPH_WIDGET_DEFAULT_SIZE = 280;
export const GRAPH_WIDGET_GAP = 12;
export const GRAPH_WIDGET_HEADER_HEIGHT = 36;

export function computeGraphWidgetPlacement(
  selection: SelectionRect,
  boardSize: { width: number; height: number },
  widgetSize = {
    width: GRAPH_WIDGET_DEFAULT_SIZE,
    height: GRAPH_WIDGET_DEFAULT_SIZE,
  },
): Pick<GraphWidgetState, "x" | "y" | "width" | "height"> {
  const width = Math.max(GRAPH_WIDGET_MIN_SIZE, widgetSize.width);
  const height = Math.max(GRAPH_WIDGET_MIN_SIZE, widgetSize.height);
  const gap = GRAPH_WIDGET_GAP;

  const rightX = selection.x + selection.width + gap;
  const leftX = selection.x - gap - width;
  const spaceRight = boardSize.width - rightX;
  const spaceLeft = leftX;

  const preferRight = spaceRight >= width || spaceRight >= spaceLeft;
  const x = preferRight
    ? Math.min(rightX, Math.max(0, boardSize.width - width))
    : Math.max(0, leftX);

  const y = Math.max(
    0,
    Math.min(selection.y, boardSize.height - height),
  );

  return { x, y, width, height };
}

export function createGraphWidgetState(
  selection: SelectionRect,
  boardSize: { width: number; height: number },
): GraphWidgetState {
  return {
    id: crypto.randomUUID(),
    example: pickRandomFunctionPlotExample(),
    ...computeGraphWidgetPlacement(selection, boardSize),
  };
}
