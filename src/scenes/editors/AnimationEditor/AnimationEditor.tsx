import {
  toTransformedContext,
  TransformCanvasRenderingContext2D,
} from "canvas-transform-context";
import { FC, useEffect, useRef } from "react";
import Editor from "../Editor";

interface AnimationEditorProps {
  image: ImageData;
  animation: Frames;
}

const AnimationEditor: FC<AnimationEditorProps> = ({ image, animation }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<TransformCanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");

    if (ctx && !ctxRef.current) ctxRef.current = toTransformedContext(ctx);
    if (!ctxRef.current) return; // stfu typescript

    const imgCanvas = document.createElement("canvas");
    imgCanvas.width = image.width;
    imgCanvas.height = image.height;
    imgCanvas.getContext("2d")?.putImageData(image, 0, 0);

    const t_ctx = ctxRef.current;

    let i = 0;

    const loop = setInterval(() => {
      const pos = animation.frames[i].position;

      t_ctx.clearCanvas();
      t_ctx.drawImage(
        imgCanvas,
        pos.x,
        pos.y,
        pos.width,
        pos.height,
        0,
        0,
        pos.width,
        pos.height
      );

      i++;
      if (i >= animation.frames.length) i = 0;
    }, 100);

    return () => {
      clearInterval(loop);
    };
  }, [animation.frames, image]);

  return (
    <>
      <Editor
        screenElement={<canvas width={1000} height={1000} ref={canvasRef} />}
        panelElement={<></>}
      />
    </>
  );
};

export default AnimationEditor;
