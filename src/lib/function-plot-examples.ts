import type { FunctionPlotOptions } from "function-plot";

export type FunctionPlotExample = {
  id: string;
  label: string;
  description: string;
  options: Pick<FunctionPlotOptions, "data" | "xAxis" | "yAxis">;
};

/**
 * Reference payloads for function-plot.
 * Each `fn` is a string expression evaluated against `x`.
 */
export const functionPlotExamples: FunctionPlotExample[] = [
  {
    id: "linear",
    label: "Lineal",
    description: "y = mx + b",
    options: {
      data: [{ fn: "2 * x + 3", color: "#60a5fa" }],
      xAxis: { domain: [-10, 10] },
      yAxis: { domain: [-10, 10] },
    },
  },
  {
    id: "quadratic",
    label: "Cuadratica",
    description: "y = ax^2 + bx + c",
    options: {
      data: [{ fn: "x^2 - 4 * x + 1", color: "#34d399" }],
      xAxis: { domain: [-10, 10] },
      yAxis: { domain: [-10, 10] },
    },
  },
  {
    id: "cubic",
    label: "Cubica",
    description: "y = ax^3 + bx^2 + cx + d",
    options: {
      data: [{ fn: "x^3 - 3 * x", color: "#f472b6" }],
      xAxis: { domain: [-4, 4] },
      yAxis: { domain: [-10, 10] },
    },
  },
  {
    id: "sine",
    label: "Seno",
    description: "y = sin(x)",
    options: {
      data: [{ fn: "sin(x)", color: "#fbbf24" }],
      xAxis: { domain: [-6.28, 6.28] },
      yAxis: { domain: [-2, 2] },
    },
  },
  {
    id: "exponential",
    label: "Exponencial",
    description: "y = e^x",
    options: {
      data: [{ fn: "exp(x)", color: "#a78bfa" }],
      xAxis: { domain: [-3, 3] },
      yAxis: { domain: [-1, 10] },
    },
  },
  {
    id: "logarithmic",
    label: "Logaritmica",
    description: "y = ln(x), solo x > 0",
    options: {
      data: [{ fn: "log(x)", color: "#fb7185", range: [0.01, 10] }],
      xAxis: { domain: [0, 10] },
      yAxis: { domain: [-3, 3] },
    },
  },
];

export function buildFunctionPlotOptions(
  target: string,
  example: FunctionPlotExample,
): FunctionPlotOptions {
  return {
    target,
    width: 480,
    height: 480,
    grid: true,
    disableZoom: false,
    ...example.options,
  };
}
