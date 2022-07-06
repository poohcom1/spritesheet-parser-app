declare module "blob-detection-mser" {
  interface MSEROptions {
    delta: number;
    minArea: number;
    maxArea: number;
    maxVariation: number;
    minDiversity: number;
  }

  type RGBA = [number, number, number, number];

  class Rect {
    top: number;
    bottom: number;
    left: number;
    right: number;

    get width(): number;
    get height(): number;
    get ratio(): number;
    get size(): number;

    add(x: number, y: number): void;
    intersect(rect: Rect): Rect;
    merge(rect: Rect, strict: boolean): void;
  }

  class Region {
    level: number;
    moments: number;
    area: number;
    variation: number;
    stable: boolean;
    rect: Rect;

    accumulate(x: number, y: number): void;
    merge(child: Region): void;
  }

  export default class MSER {
    constructor(options: MSEROptions);

    public extract(imageData: ImageData): Region[];
    public mergeRects(rects: Rect[]): Rect[];
    public drawRectOutline(rect: Rect, rgba: RGBA, imageData: ImageData): void;
  }
}
