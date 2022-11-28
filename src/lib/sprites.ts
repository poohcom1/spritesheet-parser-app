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

  const binaryImgData = getBinaryImage(
    imgData,
    // BG-color
    [image.data[0], image.data[1], image.data[2]],
    // Replace color
    [255, 255, 255]
  );

  console.log([image.data[0], image.data[1], image.data[2]]);

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

export function getFramesSize(
  frames: Frame[],
  padding: Size = { width: 0, height: 0 }
): {
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
    width: width + padding.width,
    height: height + padding.height,
  };
}

/**
 * Resize and center animation
 * @param animation
 * @param newSize
 */
export function resize(animation: Anim, newSize: Size): void {
  const deltaSize = {
    width: newSize.width - animation.size.width,
    height: newSize.height - animation.size.height,
  };

  animation.frames.forEach((frame) => {
    frame.offset.x = frame.offset.x + deltaSize.width / 2;
    frame.offset.y = frame.offset.y + deltaSize.height / 2;
  });

  animation.size = newSize;
}

/**
 *
 * @param dx
 * @param dy
 * @param anim
 * @param frameNo
 * @returns Overflow on each axis
 */
export function setFrameOffset(
  dx: number,
  dy: number,
  anim: Anim,
  frameNo: number
) {
  const frame = anim.frames[frameNo];

  const minX = 0;
  const maxX = anim.size.width - frame.view.width;

  const minY = 0;
  const maxY = anim.size.height - frame.view.height;

  frame.offset.x = Math.min(
    Math.max(minX, Math.round(frame.offset.x + dx)),
    maxX
  );
  frame.offset.y = Math.min(
    Math.max(minY, Math.round(frame.offset.y + dy)),
    maxY
  );

  return {
    x: frame.offset.x >= minX && frame.offset.x <= maxX,
    y: frame.offset.y >= minY && frame.offset.y <= maxY,
  };
}
