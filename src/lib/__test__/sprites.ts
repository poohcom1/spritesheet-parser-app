import { Rect } from "blob-detection-ts";
import { alignFramesVertically, orderRects } from "../sprites";

describe("sprites", () => {
  describe(orderRects.name, () => {
    it("should correctly order a straight row of rects", () => {
      const rect1 = new Rect(0, 0, 2, 2);
      const rect2 = new Rect(4, 0, 2, 2);
      const rect3 = new Rect(8, 0, 2, 2);
      const rect4 = new Rect(12, 0, 2, 2);
      const rect5 = new Rect(16, 0, 2, 2);
      const rect6 = new Rect(20, 0, 2, 2);

      const unsortedRects = [rect2, rect5, rect1, rect3, rect4, rect6];

      orderRects(unsortedRects);

      expect(unsortedRects).toStrictEqual([
        rect1,
        rect2,
        rect3,
        rect4,
        rect5,
        rect6,
      ]);
    });

    it("should correctly order a 2 rows of rects", () => {
      const rect1 = new Rect(0, 0, 2, 2);
      const rect2 = new Rect(4, 0, 2, 2);
      const rect3 = new Rect(8, 0, 2, 2);
      const rect4 = new Rect(0, 4, 2, 2);
      const rect5 = new Rect(4, 4, 2, 2);
      const rect6 = new Rect(8, 4, 2, 2);

      const unsortedRects = [rect2, rect5, rect1, rect3, rect4, rect6];

      orderRects(unsortedRects);

      expect(unsortedRects).toStrictEqual([
        rect1,
        rect2,
        rect3,
        rect4,
        rect5,
        rect6,
      ]);
    });
  });

  describe(alignFramesVertically.name, () => {
    const frame = (x: number, y: number, width: number, height: number) => ({
      view: new Rect(x, y, width, height),
      offset: { x: 0, y: 0 },
    });
    const point = (x: number, y: number) => ({ x, y });

    it("should align frames on a single row", () => {
      const frames = [
        frame(0, 0, 0, 20),
        frame(0, 0, 0, 15),
        frame(0, 0, 0, 10),
        frame(0, 0, 0, 5),
      ];

      alignFramesVertically(frames);

      expect(frames.map((f) => f.offset)).toStrictEqual([
        point(0, 0),
        point(0, 5),
        point(0, 10),
        point(0, 15),
      ]);
    });

    it("should align frames to the greatest height", () => {
      const frames = [frame(0, 0, 0, 5), frame(0, 0, 0, 10), frame(0, 0, 0, 7)];

      alignFramesVertically(frames);

      expect(frames.map((f) => f.offset)).toStrictEqual([
        point(0, 5),
        point(0, 0),
        point(0, 3),
      ]);
    });

    it("should align frames on two rows", () => {
      const frames = [
        frame(0, 0, 0, 10),
        frame(0, 0, 0, 5),
        frame(0, 50, 0, 10),
        frame(0, 50, 0, 5),
      ];

      alignFramesVertically(frames);

      expect(frames.map((f) => f.offset)).toStrictEqual([
        point(0, 0),
        point(0, 5),
        point(0, 0),
        point(0, 5),
      ]);
    });
  });
});
