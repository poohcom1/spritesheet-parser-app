import { Rect } from "blob-detection-ts";
import { alignFramesVertically, orderRects } from "../blob-detection";

describe("blob-detection", () => {
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
    function create_frame(
      x: number,
      y: number,
      width: number,
      height: number
    ): Frame {
      return {
        position: new Rect(x, y, width, height),
        offset: new Rect(0, 0, 0, 0),
      };
    }

    function create_pos_rect(x1: number, y1: number, x2: number, y2: number) {
      return new Rect(x1, y1, x2 - x1, y2 - y1);
    }

    it("should align frames on a single row", () => {
      const frames = [
        create_frame(0, 0, 0, 20),
        create_frame(0, 0, 0, 15),
        create_frame(0, 0, 0, 10),
        create_frame(0, 0, 0, 5),
      ];

      alignFramesVertically(frames);

      expect(frames.map((f) => f.offset)).toStrictEqual([
        create_pos_rect(0, 0, 0, 0),
        create_pos_rect(0, 5, 0, 0),
        create_pos_rect(0, 10, 0, 0),
        create_pos_rect(0, 15, 0, 0),
      ]);
    });

    it("should align frames to the greatest height", () => {
      const frames = [
        create_frame(0, 0, 0, 5),
        create_frame(0, 0, 0, 10),
        create_frame(0, 0, 0, 7),
      ];

      alignFramesVertically(frames);

      expect(frames.map((f) => f.offset)).toStrictEqual([
        create_pos_rect(0, 5, 0, 0),
        create_pos_rect(0, 0, 0, 0),
        create_pos_rect(0, 3, 0, 0),
      ]);
    });

    it("should align frames on two rows", () => {
      const frames = [
        create_frame(0, 0, 0, 10),
        create_frame(0, 0, 0, 5),
        create_frame(0, 50, 0, 10),
        create_frame(0, 50, 0, 5),
      ];

      alignFramesVertically(frames);

      expect(frames.map((f) => f.offset)).toStrictEqual([
        create_pos_rect(0, 0, 0, 0),
        create_pos_rect(0, 5, 0, 0),
        create_pos_rect(0, 0, 0, 0),
        create_pos_rect(0, 5, 0, 0),
      ]);
    });
  });
});
