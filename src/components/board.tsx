"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DrawingCanvas, type DrawingCanvasHandle } from "@/components/drawing-canvas";
import { FunctionGraphWidget } from "@/components/function-graph-widget";
import { MarqueeSelectionLayer } from "@/components/marquee-selection-layer";
import { Toolbar } from "@/components/toolbar";
import { captureBoardSelectionAsDataUrl } from "@/lib/capture-board-selection";
import {
  createLoadingGraphWidgetState,
  type GraphWidgetState,
} from "@/lib/graph-widget";
import {
  aiPlotResponseSchema,
  toFunctionPlotExample,
} from "@/lib/parse-ai-plot-response";
import {
  getRelativePoint,
  isValidSelection,
  normalizeSelection,
} from "@/lib/selection-geometry";
import type { Point, SelectionRect } from "@/types/selection";
import type { Tool } from "@/types/tools";

function isDrawingTool(tool: Tool): tool is "pencil" | "eraser" {
  return tool === "pencil" || tool === "eraser";
}

export function Board() {
  const boardRef = useRef<HTMLDivElement>(null);
  const drawingRef = useRef<DrawingCanvasHandle>(null);
  const dragStartRef = useRef<Point | null>(null);
  const isDrawingRef = useRef(false);

  const [activeTool, setActiveTool] = useState<Tool>("pencil");
  const [draftSelection, setDraftSelection] = useState<SelectionRect | null>(
    null,
  );
  const [committedSelection, setCommittedSelection] =
    useState<SelectionRect | null>(null);
  const [graphWidget, setGraphWidget] = useState<GraphWidgetState | null>(
    null,
  );

  const clearMarqueeSelection = useCallback(() => {
    dragStartRef.current = null;
    setDraftSelection(null);
    setCommittedSelection(null);
  }, []);

  const clearGraphWidget = useCallback(() => {
    setGraphWidget(null);
  }, []);

  const handleToolChange = useCallback(
    (tool: Tool) => {
      if (isDrawingRef.current) {
        drawingRef.current?.endStroke();
        isDrawingRef.current = false;
      }

      clearMarqueeSelection();
      setActiveTool(tool);
    },
    [clearMarqueeSelection],
  );

  const releasePointer = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const board = boardRef.current;

      if (board?.hasPointerCapture(event.pointerId)) {
        board.releasePointerCapture(event.pointerId);
      }
    },
    [],
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) {
        return;
      }

      const board = boardRef.current;

      if (!board) {
        return;
      }

      if (isDrawingTool(activeTool)) {
        const point = getRelativePoint(event, board);
        const mode = activeTool === "eraser" ? "erase" : "draw";
        drawingRef.current?.startStroke(point, mode);
        isDrawingRef.current = true;
        board.setPointerCapture(event.pointerId);
        return;
      }

      if (activeTool !== "marquee") {
        return;
      }

      const start = getRelativePoint(event, board);
      dragStartRef.current = start;
      setCommittedSelection(null);
      setDraftSelection({ x: start.x, y: start.y, width: 0, height: 0 });
      board.setPointerCapture(event.pointerId);
    },
    [activeTool],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const board = boardRef.current;

      if (!board) {
        return;
      }

      if (isDrawingTool(activeTool) && isDrawingRef.current) {
        drawingRef.current?.continueStroke(getRelativePoint(event, board));
        return;
      }

      const start = dragStartRef.current;

      if (!start || activeTool !== "marquee") {
        return;
      }

      const current = getRelativePoint(event, board);
      setDraftSelection(normalizeSelection(start, current));
    },
    [activeTool],
  );

  const finishInteraction = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const board = boardRef.current;

      if (!board) {
        return;
      }

      if (isDrawingTool(activeTool) && isDrawingRef.current) {
        drawingRef.current?.endStroke();
        isDrawingRef.current = false;
        releasePointer(event);
        return;
      }

      const start = dragStartRef.current;

      if (!start) {
        return;
      }

      releasePointer(event);
      dragStartRef.current = null;

      if (activeTool !== "marquee") {
        setDraftSelection(null);
        return;
      }

      const current = getRelativePoint(event, board);
      const selection = normalizeSelection(start, current);

      setDraftSelection(null);

      if (isValidSelection(selection)) {
        setCommittedSelection(selection);
      }
    },
    [activeTool, releasePointer],
  );

  const handleShowGraph = useCallback(async () => {
    const board = boardRef.current;

    if (!board || !committedSelection || graphWidget?.status === "loading") {
      return;
    }

    const boardSize = {
      width: board.clientWidth,
      height: board.clientHeight,
    };

    setGraphWidget(createLoadingGraphWidgetState(committedSelection, boardSize));

    try {
      const imageBase64 = await captureBoardSelectionAsDataUrl(
        board,
        committedSelection,
      );

      setGraphWidget((current) =>
        current
          ? { ...current, loadingStep: "interpreting" }
          : current,
      );

      const response = await fetch("/api/recognize-function", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64 }),
      });

      const payload = (await response.json()) as unknown;

      if (!response.ok) {
        const errorMessage =
          typeof payload === "object" &&
          payload !== null &&
          "error" in payload &&
          typeof payload.error === "string"
            ? payload.error
            : "No se pudo interpretar la función.";

        throw new Error(errorMessage);
      }

      const aiResponse = aiPlotResponseSchema.parse(payload);

      setGraphWidget((current) =>
        current
          ? {
              ...current,
              status: "ready",
              loadingStep: "plotting",
              example: toFunctionPlotExample(aiResponse),
              detectedExpression: aiResponse.detectedExpression,
            }
          : current,
      );
    } catch (error) {
      setGraphWidget((current) =>
        current
          ? {
              ...current,
              status: "error",
              errorMessage:
                error instanceof Error
                  ? error.message
                  : "Error desconocido al interpretar la función.",
            }
          : current,
      );
    }
  }, [committedSelection, graphWidget?.status]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      clearMarqueeSelection();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [clearMarqueeSelection]);

  return (
    <>
      <div
        ref={boardRef}
        className={`board-surface board-surface--${activeTool}`}
        aria-label="Algebraic board canvas"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishInteraction}
        onPointerCancel={finishInteraction}
      >
        <DrawingCanvas ref={drawingRef} />
        {graphWidget ? (
          <FunctionGraphWidget
            widget={graphWidget}
            onChange={setGraphWidget}
            onClose={clearGraphWidget}
          />
        ) : null}
        <MarqueeSelectionLayer
          draftSelection={draftSelection}
          committedSelection={committedSelection}
          isProcessing={graphWidget?.status === "loading"}
          onShowGraph={handleShowGraph}
        />
      </div>
      <Toolbar activeTool={activeTool} onToolChange={handleToolChange} />
    </>
  );
}
