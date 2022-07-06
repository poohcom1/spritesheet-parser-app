import { MouseEvent } from "react";

export function withCanvas(
  canvas: HTMLCanvasElement | null,
  callback: (context: CanvasRenderingContext2D) => void
): void {
  if (!canvas) return;
  const context = canvas.getContext("2d");
  if (!context) return;

  callback(context);
}

export function createRectangle(
  x: number,
  y: number,
  width: number,
  height: number
): Rectangle {
  return {
    x,
    y,
    width,
    height,
  };
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
