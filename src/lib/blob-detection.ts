import { Rect } from "blob-detection-ts";
import { cloneDeep } from "lodash";

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
