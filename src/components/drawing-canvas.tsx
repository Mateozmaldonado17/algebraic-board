"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import type { Point } from "@/types/selection";

export type DrawingMode = "draw" | "erase";

export type DrawingCanvasHandle = {
  startStroke: (point: Point, mode: DrawingMode) => void;
  continueStroke: (point: Point) => void;
  endStroke: () => void;
};

const STROKE_WIDTH = 4;
const ERASER_WIDTH = 20;
const STROKE_COLOR = "#f4f4f5";

function applyStrokeStyle(
  context: CanvasRenderingContext2D,
  mode: DrawingMode,
) {
  context.lineWidth = mode === "erase" ? ERASER_WIDTH : STROKE_WIDTH;
  context.lineCap = "round";
  context.lineJoin = "round";

  if (mode === "erase") {
    context.globalCompositeOperation = "destination-out";
    context.strokeStyle = "rgba(0, 0, 0, 1)";
    return;
  }

  context.globalCompositeOperation = "source-over";
  context.strokeStyle = STROKE_COLOR;
}

export const DrawingCanvas = forwardRef<DrawingCanvasHandle>(
  function DrawingCanvas(_props, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawingRef = useRef(false);
    const lastPointRef = useRef<Point | null>(null);
    const modeRef = useRef<DrawingMode>("draw");

    useEffect(() => {
      const canvas = canvasRef.current;
      const board = canvas?.parentElement;

      if (!canvas || !board) {
        return;
      }

      const context = canvas.getContext("2d");

      if (!context) {
        return;
      }

      const resizeCanvas = () => {
        const devicePixelRatio = window.devicePixelRatio || 1;
        const width = board.clientWidth;
        const height = board.clientHeight;
        const snapshot = document.createElement("canvas");
        const hadContent = canvas.width > 0 && canvas.height > 0;

        if (hadContent) {
          snapshot.width = canvas.width;
          snapshot.height = canvas.height;
          const snapshotContext = snapshot.getContext("2d");

          snapshotContext?.drawImage(canvas, 0, 0);
        }

        canvas.width = Math.max(1, Math.round(width * devicePixelRatio));
        canvas.height = Math.max(1, Math.round(height * devicePixelRatio));
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
        applyStrokeStyle(context, "draw");

        if (hadContent) {
          const previousWidth = snapshot.width / devicePixelRatio;
          const previousHeight = snapshot.height / devicePixelRatio;

          context.drawImage(
            snapshot,
            0,
            0,
            snapshot.width,
            snapshot.height,
            0,
            0,
            previousWidth,
            previousHeight,
          );
        }
      };

      resizeCanvas();

      const observer = new ResizeObserver(resizeCanvas);
      observer.observe(board);

      return () => observer.disconnect();
    }, []);

    useImperativeHandle(ref, () => ({
      startStroke(point: Point, mode: DrawingMode) {
        const context = canvasRef.current?.getContext("2d");

        if (!context) {
          return;
        }

        isDrawingRef.current = true;
        lastPointRef.current = point;
        modeRef.current = mode;
        applyStrokeStyle(context, mode);

        context.beginPath();
        context.moveTo(point.x, point.y);
        context.lineTo(point.x + 0.01, point.y + 0.01);
        context.stroke();
      },
      continueStroke(point: Point) {
        const context = canvasRef.current?.getContext("2d");
        const lastPoint = lastPointRef.current;

        if (!context || !isDrawingRef.current || !lastPoint) {
          return;
        }

        applyStrokeStyle(context, modeRef.current);

        context.beginPath();
        context.moveTo(lastPoint.x, lastPoint.y);
        context.lineTo(point.x, point.y);
        context.stroke();
        lastPointRef.current = point;
      },
      endStroke() {
        const context = canvasRef.current?.getContext("2d");

        isDrawingRef.current = false;
        lastPointRef.current = null;

        if (context) {
          applyStrokeStyle(context, "draw");
        }
      },
    }));

    return (
      <canvas
        ref={canvasRef}
        className="drawing-canvas"
        aria-hidden
      />
    );
  },
);
