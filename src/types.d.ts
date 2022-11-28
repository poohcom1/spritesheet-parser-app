type Rect = import("blob-detection-ts").Rect;

type RGB = [number, number, number];
type RGBA = [number, number, number, number];

interface Point {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

// Store data

interface Sheet {
  image: ImageData;
  rects: Rect[];
  name: string;
  animations: Anim[];
}

interface Anim {
  name: string;
  frames: Frame[];
  size: Size;

  editor: FramesEditor;
}

interface Frame {
  view: Rect;
  offset: Point;
}

interface FramesEditor {
  zoom: number;
  fps: number;
  playing: boolean;

  frameNo: number;
}

// API
interface LoadImageResponse {
  buffer: string;
}
