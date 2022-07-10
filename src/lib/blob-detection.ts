import MSER, { MSEROptions, Rect } from "blob-detection-ts";
import { cloneDeep } from "lodash";
import { getBinaryImage } from "./image";

const DEFAULT_OPTIONS = {
  delta: 0,
  minArea: 0,
  maxArea: 0.5,
  maxVariation: 0.5,
  minDiversity: 0.33,
};

/**
 * Detects blobs using MSER
 * @param image
 * @param options
 * @returns
 */
export function blobDetection(
  image: ImageData | undefined,
  options: MSEROptions = DEFAULT_OPTIONS
): Rect[] {
  if (!image) return [];

  const imgData = new ImageData(
    new Uint8ClampedArray(image.data),
    image.width,
    image.height
  );
  const binaryImgData = getBinaryImage(imgData);
  const mser = new MSER(options);

  let rects = mser.extract(binaryImgData).map((r) => r.rect);

  rects = mser.mergeRects(rects);

  return rects;
}

/**
 * Merges a list of rects into a single rect
 * @param rects
 * @returns
 */
export function mergeRects(rects: Rect[]): Rect {
  const rect = cloneDeep(rects[0]);

  for (let i = 1; i < rects.length; i++) {
    rect.merge(rects[i]);
  }

  return rect;
}

function rectOverlapsInDirection(rect1: Rect, rect2: Rect): boolean {
  return rect1.y <= rect2.y + rect2.height && rect1.y + rect1.height >= rect2.y;
}

function compareRect(blob1: Rect, blob2: Rect): number {
  if (rectOverlapsInDirection(blob1, blob2)) {
    return blob1.x - blob2.x;
  } else {
    return blob1.y - blob2.y;
  }
}

/**
 * Order rects from left to right and top to bottom
 * @param rects
 */
export function orderRects(rects: Rect[]): void {
  rects.sort(compareRect);

  const previousBlob = rects[0] as Rect & { row: number; col: number };
  previousBlob.row = 0;
  previousBlob.col = 0;

  for (let i = 1; i < rects.length; i++) {
    const currentBlob = rects[i] as Rect & { row: number; col: number };

    if (rectOverlapsInDirection(currentBlob, previousBlob)) {
      currentBlob.col = previousBlob.col + 1;
      currentBlob.row = previousBlob.row;
    } else {
      currentBlob.col = 0;
      currentBlob.row = previousBlob.row + 1;
    }
  }
}

/**
 * Aligns frames to the bottom by adjusting the offset so that
 *  every frame touches the bottom
 * @param frames
 * @returns
 */
export function alignFramesVertically(frames: Frame[]) {
  if (frames.length === 0) return;

  let baseline = 0;

  for (const frame of frames) {
    baseline = Math.max(frame.view.height, baseline);
  }

  for (const frame of frames) {
    frame.offset.y = baseline - frame.view.height;
  }
}

export function getFramesSize(frames: Frame[]): {
  width: number;
  height: number;
} {
  let width = 0;
  let height = 0;

  for (const frame of frames) {
    width = Math.max(frame.offset.x + frame.view.width, width);
    height = Math.max(frame.offset.y + frame.view.height, height);
  }

  return {
    width,
    height,
  };
}
