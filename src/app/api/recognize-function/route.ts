import { NextResponse } from "next/server";
import OpenAI from "openai";
import {
  PLOT_SYSTEM_PROMPT,
  PLOT_USER_PROMPT,
} from "@/lib/openai/plot-system-prompt";
import { parseAiPlotJson } from "@/lib/parse-ai-plot-response";

export const runtime = "nodejs";

type RecognizeFunctionRequest = {
  imageBase64?: string;
};

export async function POST(request: Request) {
  const apiKey = process.env.OPEN_AI_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing OPEN_AI_KEY environment variable." },
      { status: 500 },
    );
  }

  let body: RecognizeFunctionRequest;

  try {
    body = (await request.json()) as RecognizeFunctionRequest;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  if (!body.imageBase64?.startsWith("data:image/")) {
    return NextResponse.json(
      { error: "imageBase64 must be a data URL image." },
      { status: 400 },
    );
  }

  try {
    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: PLOT_SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: PLOT_USER_PROMPT },
            {
              type: "image_url",
              image_url: { url: body.imageBase64 },
            },
          ],
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "OpenAI returned an empty response." },
        { status: 502 },
      );
    }

    const plotConfig = parseAiPlotJson(content);

    return NextResponse.json(plotConfig);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to recognize function.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
