import { TransformCanvasRenderingContext2D } from "canvas-transform-context";
import { MouseEvent } from "react";

export function mouse2transformCanvas(
  e: MouseEvent,
  ctx: TransformCanvasRenderingContext2D
): Point {
  const point = mouse2canvas(e, ctx.canvas);

  const transformedPoint = ctx.transformedPoint(point.x, point.y);

  return transformedPoint;
}

export function mouse2canvas(e: MouseEvent, canvas: HTMLCanvasElement): Point {
  const bounds = canvas.getBoundingClientRect();

  let x = e.clientX - bounds.left;
  let y = e.clientY - bounds.top;

  if (e.pageX < bounds.left + window.scrollX) {
    x = 0;
  }
  if (e.pageX > bounds.right + window.scrollX) {
    x = bounds.width;
  }

  if (e.pageY < bounds.top + window.scrollY) {
    y = 0;
  }
  if (e.pageY > bounds.bottom + window.scrollY) {
    y = bounds.height;
  }

  return { x, y };
}
