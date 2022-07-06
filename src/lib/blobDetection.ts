import MSER from "blob-detection-mser";

const mser = new MSER({
  delta: 2,
  minArea: 0.00001,
  maxArea: 0.5,
  maxVariation: 0.5,
  minDiversity: 0.33,
});
