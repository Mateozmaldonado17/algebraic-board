"use client";

import functionPlot from "function-plot";
import { useEffect, useRef, useState } from "react";
import { buildFunctionPlotOptions } from "@/lib/function-plot-examples";
import {
  GRAPH_WIDGET_HEADER_HEIGHT,
  GRAPH_WIDGET_MIN_SIZE,
  LOADING_STEP_MESSAGES,
  type GraphWidgetState,
} from "@/lib/graph-widget";

type FunctionGraphWidgetProps = {
  widget: GraphWidgetState;
  onChange: (widget: GraphWidgetState) => void;
  onClose: () => void;
};

type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
};

type ResizeState = {
  pointerId: number;
  startX: number;
  startY: number;
  originWidth: number;
  originHeight: number;
};

export function FunctionGraphWidget({
  widget,
  onChange,
  onClose,
}: FunctionGraphWidgetProps) {
  const plotTargetRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const resizeStateRef = useRef<ResizeState | null>(null);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  const plotHeight = Math.max(
    120,
    widget.height - GRAPH_WIDGET_HEADER_HEIGHT,
  );
  const plotWidth = Math.max(120, widget.width);
  const isLoading = widget.status === "loading";
  const isError = widget.status === "error";

  const loadingMessages = widget.loadingStep
    ? [
        LOADING_STEP_MESSAGES[widget.loadingStep],
        "Analizando trazos con visión artificial...",
        "Preparando function-plot...",
      ]
    : ["Procesando..."];

  useEffect(() => {
    if (!isLoading) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setLoadingMessageIndex((current) => (current + 1) % loadingMessages.length);
    }, 1400);

    return () => window.clearInterval(intervalId);
  }, [isLoading, loadingMessages.length]);

  useEffect(() => {
    if (widget.status !== "ready" || !widget.example) {
      return;
    }

    const target = plotTargetRef.current;

    if (!target) {
      return;
    }

    target.replaceChildren();
    const plotRoot = document.createElement("div");
    plotRoot.className = "function-graph-widget__plot-root";
    target.appendChild(plotRoot);

    functionPlot(
      buildFunctionPlotOptions(plotRoot, widget.example, {
        width: plotWidth,
        height: plotHeight,
      }),
    );
  }, [plotHeight, plotWidth, widget.example, widget.status]);

  const handleDragPointerDown = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);

    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: widget.x,
      originY: widget.y,
    };
  };

  const handleDragPointerMove = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    const dragState = dragStateRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    onChange({
      ...widget,
      x: dragState.originX + (event.clientX - dragState.startX),
      y: dragState.originY + (event.clientY - dragState.startY),
    });
  };

  const handleDragPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    dragStateRef.current = null;
  };

  const handleResizePointerDown = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);

    resizeStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originWidth: widget.width,
      originHeight: widget.height,
    };
  };

  const handleResizePointerMove = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    const resizeState = resizeStateRef.current;

    if (!resizeState || resizeState.pointerId !== event.pointerId) {
      return;
    }

    onChange({
      ...widget,
      width: Math.max(
        GRAPH_WIDGET_MIN_SIZE,
        resizeState.originWidth + (event.clientX - resizeState.startX),
      ),
      height: Math.max(
        GRAPH_WIDGET_MIN_SIZE,
        resizeState.originHeight + (event.clientY - resizeState.startY),
      ),
    });
  };

  const handleResizePointerUp = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    const resizeState = resizeStateRef.current;

    if (!resizeState || resizeState.pointerId !== event.pointerId) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    resizeStateRef.current = null;
  };

  const title =
    widget.status === "ready" && widget.example
      ? widget.example.label
      : widget.status === "error"
        ? "Error de interpretación"
        : "Analizando función";

  const subtitle =
    widget.status === "ready"
      ? (typeof widget.example?.options.data?.[0]?.fn === "string"
          ? widget.example.options.data[0].fn
          : widget.detectedExpression)
      : widget.status === "error"
        ? widget.errorMessage
        : loadingMessages[loadingMessageIndex];

  return (
    <div
      className={`function-graph-widget${isLoading ? " function-graph-widget--loading" : ""}${isError ? " function-graph-widget--error" : ""}`}
      style={{
        left: widget.x,
        top: widget.y,
        width: widget.width,
        height: widget.height,
      }}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <div
        className="function-graph-widget__header"
        onPointerDown={handleDragPointerDown}
        onPointerMove={handleDragPointerMove}
        onPointerUp={handleDragPointerUp}
        onPointerCancel={handleDragPointerUp}
      >
        <div className="function-graph-widget__header-text">
          <span className="function-graph-widget__title">{title}</span>
          <span className="function-graph-widget__subtitle">{subtitle}</span>
        </div>

        <button
          type="button"
          className="function-graph-widget__close"
          aria-label="Cerrar gráfica"
          title="Cerrar gráfica"
          onClick={(event) => {
            event.stopPropagation();
            onClose();
          }}
          onPointerDown={(event) => event.stopPropagation()}
        >
          ×
        </button>
      </div>

      <div
        ref={plotTargetRef}
        className="function-graph-widget__plot"
        style={{ height: plotHeight }}
      >
        {isLoading ? (
          <div className="function-graph-widget__loading">
            <div className="function-graph-widget__spinner" aria-hidden />
            <p className="function-graph-widget__loading-text">
              {loadingMessages[loadingMessageIndex]}
            </p>
            <div className="function-graph-widget__loading-bar">
              <div className="function-graph-widget__loading-bar-fill" />
            </div>
          </div>
        ) : null}

        {isError ? (
          <div className="function-graph-widget__error">
            <p>No se pudo interpretar la función manuscrita.</p>
          </div>
        ) : null}
      </div>

      {!isLoading ? (
        <div
          className="function-graph-widget__resize-handle"
          aria-hidden
          onPointerDown={handleResizePointerDown}
          onPointerMove={handleResizePointerMove}
          onPointerUp={handleResizePointerUp}
          onPointerCancel={handleResizePointerUp}
        />
      ) : null}
    </div>
  );
}
