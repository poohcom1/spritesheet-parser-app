import {
  FC,
  MouseEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import styled from "styled-components";
import MSER, { Rect } from "blob-detection-ts";
import { mouse2canvas, withCanvas } from "../../lib/canvas";

const CanvasLayer = styled.canvas<{ zIndex: number }>`
  position: absolute;
  z-index: ${(props) => props.zIndex};
`;

const CanvasContainer = styled.div<{ width: number; height: number }>`
  position: relative;
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  background-color: white;
`;

interface SelectionCanvasProps {
  image: ImageData;
  rects: Rect[];
  selectedRects: Rect[];

  onSelect(rects: Rect[]): void;
}

const SelectionCanvas: FC<SelectionCanvasProps> = ({
  image,
  rects,
  selectedRects,
  onSelect,
}) => {
  const imageCanvasRef = useRef<HTMLCanvasElement>(null);
  const rectsCanvasRef = useRef<HTMLCanvasElement>(null);
  const selectionCanvasRef = useRef<HTMLCanvasElement>(null);

  const anchorRef = useRef<Point | undefined>();
  const [selection, setSelection] = useState<Rect>(new Rect());

  // Image canvas
  useEffect(() => {
    const rectImage = new ImageData(
      new Uint8ClampedArray(image.data),
      image.width,
      image.height
    );

    const mser = new MSER();

    rects.forEach((rect) => {
      mser.drawRectOutline(rect, [255, 0, 0, 255], rectImage);
    });

    withCanvas(imageCanvasRef.current, (context) => {
      context.putImageData(rectImage, 0, 0);
    });
  }, [image, rects]);

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

  const onMouseDown: MouseEventHandler<HTMLCanvasElement> = useCallback(
    (e) => {
      if (selectionCanvasRef.current) {
        anchorRef.current = mouse2canvas(e, selectionCanvasRef.current);
        onSelect([]);
      }
    },
    [onSelect]
  );

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
          if (intersection) {
            intersects.push(rect);
          }
        }

        setSelection(new Rect(left, top, width, height));
        onSelect(intersects);
      }
    },
    [onSelect, rects, selection]
  );

  const onMouseUp: MouseEventHandler<HTMLCanvasElement> = useCallback((e) => {
    anchorRef.current = undefined;
    setSelection(new Rect(0, 0, 0, 0));
  }, []);

  return (
    <CanvasContainer width={image.width} height={image.height}>
      <CanvasLayer
        zIndex={0}
        ref={imageCanvasRef}
        width={image.width}
        height={image.height}
      />
      <CanvasLayer
        zIndex={1}
        ref={rectsCanvasRef}
        width={image.width}
        height={image.height}
      />
      <CanvasLayer
        zIndex={2}
        ref={selectionCanvasRef}
        width={image.width}
        height={image.height}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseUp}
      />
    </CanvasContainer>
  );
};

export default SelectionCanvas;
