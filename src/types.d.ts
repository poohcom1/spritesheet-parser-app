type Rect = import("blob-detection-ts").Rect;

type RGB = [number, number, number];
type RGBA = [number, number, number, number];

interface Point {
  x: number;
  y: number;
}

// Store data

interface Sheet {
  image: ImageData;
  rects: Rect[];
  name: string;
  animations: Frames[];
}

interface Frames {
  name: string;
  frames: Frame[];
  padding: Point;

  editor: FramesEditor;
}

interface Frame {
  position: Rect;
  offset: Rect;
}

interface FramesEditor {
  zoom: number;
  fps: number;
  playing: boolean;

  frameNo: number;
}
