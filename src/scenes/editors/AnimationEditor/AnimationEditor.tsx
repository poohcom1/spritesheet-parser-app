import { getFramesSize } from "lib/blob-detection";
import { FC, useEffect, useRef, useState } from "react";
import useDisplayStore from "stores/displayStore";
import Editor from "../Editor";

interface AnimationEditorProps {
  image: ImageData;
  animation: Frames;
}

const AnimationEditor: FC<AnimationEditorProps> = ({ image, animation }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const zoom = useDisplayStore((s) => s.zoom);

  const [size, setSize] = useState(getFramesSize(animation.frames));
  const [padding, setPadding] = useState({ x: 10, y: 10 });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");

    if (!ctx) return;

    const imgCanvas = document.createElement("canvas");
    imgCanvas.width = image.width;
    imgCanvas.height = image.height;
    imgCanvas.getContext("2d")?.putImageData(image, 0, 0);

    setSize(getFramesSize(animation.frames));

    let i = 0;

    const loop = setInterval(() => {
      const frame = animation.frames[i];

      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.drawImage(
        imgCanvas,
        frame.position.x,
        frame.position.y,
        frame.position.width,
        frame.position.height,
        frame.offset.left + padding.x,
        frame.offset.top + padding.y,
        frame.position.width,
        frame.position.height
      );

      i++;
      if (i >= animation.frames.length) i = 0;
    }, 100);

    return () => {
      clearInterval(loop);
    };
  }, [animation.frames, image, padding.x, padding.y]);

  return (
    <>
      <Editor
        screenElement={
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ width: "100%", height: "100%" }}
          >
            <canvas
              style={{
                transform: `scale(${Math.pow(1.1, zoom)})`,
                flexGrow: "0",
                flexShrink: "0",
              }}
              width={size.width + padding.x * 2}
              height={size.height + padding.y * 2}
              ref={canvasRef}
            />
          </div>
        }
        panelElement={<></>}
      />
    </>
  );
};

export default AnimationEditor;
