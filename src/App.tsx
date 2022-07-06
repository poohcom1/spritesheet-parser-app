import MSER from "blob-detection-mser";
import React, { useCallback, useRef } from "react";
import { getBinaryImage, getImageData } from "./lib/image";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onFileChange = useCallback(async (file: File | null) => {
    if (!file) return;

    const imgData = await getImageData(file);
    const binaryImgData = getBinaryImage(imgData);

    const mser = new MSER({
      delta: 2,
      minArea: 0.00001,
      maxArea: 0.5,
      maxVariation: 0.5,
      minDiversity: 0.33,
    });

    let rects = mser.extract(binaryImgData).map((r) => r.rect);

    rects.forEach((rect) => {
      mser.drawRectOutline(rect, [255, 0, 0, 255], imgData);
    });

    const context = canvasRef.current?.getContext("2d");

    if (context) {
      context.putImageData(imgData, 0, 0);
    }
  }, []);

  return (
    <div>
      <input
        type="file"
        onChange={(e) => onFileChange(e.target.files && e.target.files[0])}
      />
      <br></br>
      <canvas ref={canvasRef} width={1000} height={3000} />
    </div>
  );
}

export default App;
