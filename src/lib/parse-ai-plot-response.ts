import { z } from "zod";
import type { FunctionPlotExample } from "@/lib/function-plot-examples";

const domainSchema = z.tuple([z.number(), z.number()]);

export const aiPlotResponseSchema = z.object({
  detectedExpression: z.string().min(1),
  functionType: z.enum([
    "linear",
    "quadratic",
    "cubic",
    "sine",
    "exponential",
    "logarithmic",
    "other",
  ]),
  label: z.string().min(1),
  plot: z.object({
    data: z
      .array(
        z.object({
          fn: z.string().min(1),
          color: z.string().optional(),
          range: domainSchema.optional(),
        }),
      )
      .min(1),
    xAxis: z.object({
      domain: domainSchema,
    }),
    yAxis: z.object({
      domain: domainSchema,
    }),
  }),
  confidence: z.number().min(0).max(1),
});

export type AiPlotResponse = z.infer<typeof aiPlotResponseSchema>;

export function stripMarkdownJson(raw: string): string {
  return raw
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
}

export function parseAiPlotJson(raw: string): AiPlotResponse {
  const cleaned = stripMarkdownJson(raw);
  const parsed = JSON.parse(cleaned) as unknown;

  return aiPlotResponseSchema.parse(parsed);
}

export function toFunctionPlotExample(
  response: AiPlotResponse,
): FunctionPlotExample {
  return {
    id: response.functionType,
    label: response.label,
    description: response.detectedExpression,
    options: response.plot,
  };
}
