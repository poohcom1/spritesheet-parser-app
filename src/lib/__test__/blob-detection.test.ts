import { Rect } from "blob-detection-ts";
import { orderRects } from "../blob-detection";

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
});
