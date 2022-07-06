import MSER from "blob-detection-mser";
import React, { useCallback, useState } from "react";
import "./App.css";
import SelectionCanvas from "./components/SelectionCanvas/SelectionCanvas";
import { getBinaryImage, getImageData } from "./lib/image";

function App() {
  const [allRects, setAllRects] = useState<Rect[]>([]);
  const [imageData, setImageData] = useState<ImageData | undefined>(undefined);

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

    setAllRects(rects);
    setImageData(imgData);
  }, []);

  return (
    <div>
      <h2>Spritesheet Parser</h2>
      <input
        type="file"
        onChange={(e) => onFileChange(e.target.files && e.target.files[0])}
      />
      {imageData && <SelectionCanvas image={imageData} rects={allRects} />}
    </div>
  );
}

export default App;
