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

/**
 * TODO
 * @param rects
 */
export function sortRects(rects: Rect[]): void {
  rects.sort();
}
