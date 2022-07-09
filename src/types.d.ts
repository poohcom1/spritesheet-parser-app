type Rect = import("blob-detection-ts").Rect;

type RGB = [number, number, number];
type RGBA = [number, number, number, number];

interface Point {
  x: number;
  y: number;
}

interface Sprites {
  name: string;
  rects: Rect[];
}

interface Sheet {
  image: ImageData;
  rects: Rect[];
  name: string;
  animations: Sprites[];
}
