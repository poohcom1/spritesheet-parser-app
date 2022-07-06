import { Rect } from "blob-detection-ts";
import {
  FC,
  MouseEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { mouse2canvas, withCanvas } from "../../lib/canvas";

interface SelectionCanvasProps {
  image: ImageData;
  rects: Rect[];
}

const SelectionCanvas: FC<SelectionCanvasProps> = ({ image, rects }) => {
  const imageCanvasRef = useRef<HTMLCanvasElement>(null);
  const rectsCanvasRef = useRef<HTMLCanvasElement>(null);
  const selectionCanvasRef = useRef<HTMLCanvasElement>(null);

  const anchorRef = useRef<Point | undefined>();
  const [selection, setSelection] = useState<Rect>(new Rect());

  const [selectedRects, setSelectedRects] = useState<Rect[]>([]);

  // Image canvas
  useEffect(() => {
    withCanvas(imageCanvasRef.current, (context) => {
      context.putImageData(image, 0, 0);
    });
  }, [image]);

  // Rects canvas
  useEffect(() => {
    withCanvas(rectsCanvasRef.current, (context) => {
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);
      selectedRects.forEach((rect) => {
        context.fillStyle = "#ff000055";
        context.fillRect(rect.x + 1, rect.y + 1, rect.width, rect.height);
      });
    });
  }, [selectedRects]);

  // Selection canvas
  useEffect(() => {
    withCanvas(selectionCanvasRef.current, (context) => {
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);
      context.fillStyle = "#ff0000aa";
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
      setSelectedRects([]);
    }
  }, []);

  const onMouseMove: MouseEventHandler<HTMLCanvasElement> = useCallback(
    (e) => {
      if (selectionCanvasRef.current && anchorRef.current) {
        const begin = anchorRef.current;
        const end = mouse2canvas(e, selectionCanvasRef.current);

        const width = Math.abs(begin.x - end.x);
        const height = Math.abs(begin.y - end.y);
        const left = Math.min(begin.x, end.x);
        const top = Math.min(begin.y, end.y);

        // Calculate selection
        const intersects: Rect[] = [];

        for (const rect of rects) {
          const intersection = selection.intersect(rect);
          if (intersection.width > 0 && intersection.height > 0) {
            intersects.push(rect);
          }
        }

        setSelectedRects(intersects);
        setSelection(new Rect(left, top, width, height));
      }
    },
    [rects, selection]
  );

  const onMouseUp: MouseEventHandler<HTMLCanvasElement> = useCallback((e) => {
    anchorRef.current = undefined;
    setSelection(new Rect(0, 0, 0, 0));
  }, []);

  return (
    <>
      <div className="relative">
        <canvas
          className="absolute z-0  border-2 border-stone-800"
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
          onMouseLeave={onMouseUp}
        />
      </div>
    </>
  );
};

export default SelectionCanvas;
