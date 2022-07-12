import { MouseEvent } from "react";

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

  return {
    x,
    y,
  };
}

export function mouse2scaledCanvas(
  e: MouseEvent,
  canvas: HTMLCanvasElement,
  scale: number
) {
  const mousePos = mouse2canvas(e, canvas);

  const transform = new DOMMatrix().scale(scale, scale);

  return new DOMPoint(mousePos.x, mousePos.y).matrixTransform(
    transform.inverse()
  );
}

export function getImageCanvas(image: ImageData): HTMLCanvasElement {
  const imgCanvas = document.createElement("canvas");
  imgCanvas.width = image.width;
  imgCanvas.height = image.height;
  imgCanvas.getContext("2d")?.putImageData(image, 0, 0);
  return imgCanvas;
}
