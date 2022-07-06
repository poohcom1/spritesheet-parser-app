import {
  FC,
  MouseEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createRectangle, mouse2canvas, withCanvas } from "../../lib/canvas";

interface SelectionCanvasProps {
  image: ImageData;
  rects: Rect[];
}

const SelectionCanvas: FC<SelectionCanvasProps> = ({ image, rects }) => {
  const imageCanvasRef = useRef<HTMLCanvasElement>(null);
  const rectsCanvasRef = useRef<HTMLCanvasElement>(null);
  const selectionCanvasRef = useRef<HTMLCanvasElement>(null);

  const anchorRef = useRef<Point | undefined>();
  const [selection, setSelection] = useState<Rectangle>(
    createRectangle(0, 0, 0, 0)
  );

  useEffect(() => {
    if (
      !imageCanvasRef.current ||
      !rectsCanvasRef.current ||
      !selectionCanvasRef.current
    )
      return;

    const imageContext = imageCanvasRef.current.getContext("2d");
    const rectsContext = imageCanvasRef.current.getContext("2d");
    const selectionsContext = selectionCanvasRef.current.getContext("2d");

    if (!imageContext || !rectsContext || !selectionsContext) return;

    // Image canvas
    imageContext.putImageData(image, 0, 0);
  }, [image, rects]);

  // Selection canvas
  useEffect(() => {
    withCanvas(selectionCanvasRef.current, (context) => {
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);
      if (selection.width > 0 && selection.height > 0) {
        context.fillRect(
          selection.x,
          selection.y,
          selection.width,
          selection.height
        );
      }
    });
  }, [selection]);

  const onMouseDown: MouseEventHandler<HTMLCanvasElement> = useCallback((e) => {
    if (selectionCanvasRef.current) {
      anchorRef.current = mouse2canvas(e, selectionCanvasRef.current);
    }
  }, []);

  const onMouseMove: MouseEventHandler<HTMLCanvasElement> = useCallback((e) => {
    if (selectionCanvasRef.current && anchorRef.current) {
      const begin = anchorRef.current;
      const end = mouse2canvas(e, selectionCanvasRef.current);

      const width = Math.abs(begin.x - end.x);
      const height = Math.abs(begin.y - end.y);
      const left = Math.min(begin.x, end.x);
      const top = Math.min(begin.y, end.y);

      setSelection(createRectangle(left, top, width, height));
    }
  }, []);

  const onMouseUp: MouseEventHandler<HTMLCanvasElement> = useCallback((e) => {
    anchorRef.current = undefined;
    setSelection(createRectangle(0, 0, 0, 0));
  }, []);

  return (
    <>
      <div className="relative">
        <canvas
          className="absolute z-0"
          ref={imageCanvasRef}
          width={image.width}
          height={image.height}
        />
        <canvas
          className="absolute z-10"
          ref={rectsCanvasRef}
          width={image.width}
          height={image.height}
        />
        <canvas
          className="absolute z-20"
          ref={selectionCanvasRef}
          width={image.width}
          height={image.height}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onMouseMove={onMouseMove}
        />
      </div>
    </>
  );
};

export default SelectionCanvas;
