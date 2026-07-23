"use client";

import functionPlot from "function-plot";
import { useEffect, useRef } from "react";
import { buildFunctionPlotOptions } from "@/lib/function-plot-examples";
import {
  GRAPH_WIDGET_HEADER_HEIGHT,
  GRAPH_WIDGET_MIN_SIZE,
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

  const plotHeight = Math.max(
    120,
    widget.height - GRAPH_WIDGET_HEADER_HEIGHT,
  );
  const plotWidth = Math.max(120, widget.width);

  useEffect(() => {
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
  }, [plotHeight, plotWidth, widget.example]);

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

  return (
    <div
      className="function-graph-widget"
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
          <span className="function-graph-widget__title">
            {widget.example.label}
          </span>
          <span className="function-graph-widget__subtitle">
            {typeof widget.example.options.data?.[0]?.fn === "string"
              ? widget.example.options.data[0].fn
              : widget.example.description}
          </span>
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
      />

      <div
        className="function-graph-widget__resize-handle"
        aria-hidden
        onPointerDown={handleResizePointerDown}
        onPointerMove={handleResizePointerMove}
        onPointerUp={handleResizePointerUp}
        onPointerCancel={handleResizePointerUp}
      />
    </div>
  );
}
