type Rect = import("blob-detection-ts").Rect;

type RGB = [number, number, number];
type RGBA = [number, number, number, number];

interface Point {
  x: number;
  y: number;
}

interface Frame {
  position: Rect;
  offset: Rect;
}

interface Frames {
  name: string;
  frames: Frame[];
}

interface Sheet {
  image: ImageData;
  rects: Rect[];
  name: string;
  animations: Frames[];
}
