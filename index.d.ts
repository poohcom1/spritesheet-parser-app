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
  name: string;
  animations: Sprites[];
}
