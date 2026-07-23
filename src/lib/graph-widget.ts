import type { FunctionPlotExample } from "@/lib/function-plot-examples";
import { functionPlotExamples } from "@/lib/function-plot-examples";

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
export const GRAPH_WIDGET_HEADER_HEIGHT = 36;
