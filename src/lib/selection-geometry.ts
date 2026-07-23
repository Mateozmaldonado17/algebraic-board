export type SelectionRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Point = {
  x: number;
  y: number;
};

export function getRelativePoint(
  event: { clientX: number; clientY: number },
  element: HTMLElement,
): Point {
  const bounds = element.getBoundingClientRect();

  return {
    x: event.clientX - bounds.left,
    y: event.clientY - bounds.top,
  };
}

export function normalizeSelection(start: Point, end: Point): SelectionRect {
  const x = Math.min(start.x, end.x);
  const y = Math.min(start.y, end.y);
  const width = Math.abs(end.x - start.x);
  const height = Math.abs(end.y - start.y);

  return { x, y, width, height };
}

export function isValidSelection(
  selection: SelectionRect,
  minSize = 4,
): boolean {
  return selection.width >= minSize && selection.height >= minSize;
}
