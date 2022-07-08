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

export function orderRects(blobList: Rect[]): void {
  blobList.sort(compareRect);

  const previousBlob = blobList[0] as Rect & { row: number; col: number };
  previousBlob.row = 0;
  previousBlob.col = 0;

  for (let i = 1; i < blobList.length; i++) {
    const currentBlob = blobList[i] as Rect & { row: number; col: number };

    if (rectOverlapsInDirection(currentBlob, previousBlob)) {
      currentBlob.col = previousBlob.col + 1;
      currentBlob.row = previousBlob.row;
    } else {
      currentBlob.col = 0;
      currentBlob.row = previousBlob.row + 1;
    }
  }
}
