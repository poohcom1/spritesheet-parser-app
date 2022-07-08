import {
  FC,
  MouseEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
  WheelEventHandler,
} from "react";
import styled from "styled-components";
import MSER, { Rect } from "blob-detection-ts";
import { mouse2transformCanvas, withCanvas } from "../../lib/canvas";
import { useContext } from "react";
import { EditorContext } from "../../context/EditorContext";
import { TransformCanvasRenderingContext2D } from "canvas-transform";

const CanvasLayer = styled.canvas<{ z: number }>`
  position: absolute;
  z-index: ${(props) => props.z};
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

function withContexts(
  contexts: (TransformCanvasRenderingContext2D | undefined)[],
  callback: (ctx: TransformCanvasRenderingContext2D) => void
) {
  for (const ctx of contexts) {
    if (ctx) callback(ctx);
  }
}

const SelectionCanvas: FC<SelectionCanvasProps> = ({
  image,
  rects,
  selectedRects,
  onSelect,
}) => {
  // Editor context
  const editorContext = useContext(EditorContext);
  const setEditorValue = editorContext.setValue;

  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageCanvasRef = useRef<HTMLCanvasElement>(null);
  const rectsCanvasRef = useRef<HTMLCanvasElement>(null);
  const selectCanvasRef = useRef<HTMLCanvasElement>(null);

  const imageCtxRef = useRef<TransformCanvasRenderingContext2D | undefined>();
  const rectsCtxRef = useRef<TransformCanvasRenderingContext2D | undefined>();
  const selectCtxRef = useRef<TransformCanvasRenderingContext2D | undefined>();

  const anchorRef = useRef<Point | undefined>();
  const [selection, setSelection] = useState<Rect>(new Rect());

  useEffect(() => {
    withCanvas(bgCanvasRef.current, (context) => {
      context.fillStyle = "white";
      context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    });
  }, []);

  // Image canvas
  useEffect(() => {
    const rectImage = new ImageData(
      new Uint8ClampedArray(image.data),
      image.width,
      image.height
    );

    const mser = new MSER();

    rects.forEach((rect) => {
      mser.drawRectOutline(rect, [0, 0, 0, 50], rectImage);
    });

    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    canvas.getContext("2d")?.putImageData(rectImage, 0, 0);

    imageCtxRef.current = withCanvas(imageCanvasRef.current, (ctx) => {
      ctx.clearCanvas();
      ctx.drawImage(canvas, 0, 0);
    });
  }, [image, rects]);

  // Rects canvas
  useEffect(() => {
    rectsCtxRef.current = withCanvas(rectsCanvasRef.current, (ctx) => {
      ctx.clearCanvas();
      selectedRects.forEach((rect) => {
        ctx.fillStyle = "#ff000055";
        ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
      });
    });
  }, [selectedRects]);

  const preSelection = useRef(new Rect());

  // Selection canvas
  useEffect(() => {
    selectCtxRef.current = withCanvas(selectCanvasRef.current, (ctx) => {
      ctx.clearRect(
        preSelection.current.x - 5,
        preSelection.current.y - 5,
        preSelection.current.width + 10,
        preSelection.current.height + 10
      );
      ctx.fillStyle = "#ff0000aa";
      if (selection.width > 0 && selection.height > 0) {
        ctx.fillRect(
          selection.x,
          selection.y,
          selection.width,
          selection.height
        );
        preSelection.current = selection;
      }
    });
  }, [selection]);

  const contexts = useCallback(
    () => [imageCtxRef.current, rectsCtxRef.current, selectCtxRef.current],
    []
  );

  const onMouseDown: MouseEventHandler<HTMLCanvasElement> = useCallback(
    (e) => {
      if (e.ctrlKey || e.metaKey) {
        withContexts(contexts(), (ctx) => ctx.startMove(e.nativeEvent));
      } else {
        if (selectCtxRef.current) {
          anchorRef.current = mouse2transformCanvas(e, selectCtxRef.current);
          onSelect([]);
        }
      }
    },
    [contexts, onSelect]
  );

  const onMouseMove: MouseEventHandler<HTMLCanvasElement> = useCallback(
    (e) => {
      withContexts(contexts(), (ctx) => ctx.move(e.nativeEvent));
      if (!(e.ctrlKey || e.metaKey)) {
        if (selectCtxRef.current && anchorRef.current) {
          const begin = anchorRef.current;
          const end = mouse2transformCanvas(e, selectCtxRef.current);

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
      }
    },
    [contexts, onSelect, rects, selection]
  );

  const onMouseUp: MouseEventHandler<HTMLCanvasElement> = useCallback(
    (e) => {
      withContexts(contexts(), (ctx) => ctx.endMove(e.nativeEvent));

      anchorRef.current = undefined;
      setSelection(new Rect(0, 0, 0, 0));
    },
    [contexts]
  );

  const zoomRef = useRef(editorContext.value.zoom);

  const onWheel: WheelEventHandler<HTMLCanvasElement> = useCallback(
    (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }

      setEditorValue({
        zoom: editorContext.value.zoom - Math.sign(e.deltaY),
      });
    },
    [setEditorValue, editorContext.value.zoom]
  );

  useEffect(() => {
    if (editorContext.value.zoom !== zoomRef.current) {
      const diff = editorContext.value.zoom - zoomRef.current;
      zoomRef.current = editorContext.value.zoom;
      withContexts(contexts(), (ctx) => ctx.zoom(diff));
    }
  }, [contexts, editorContext.value.zoom]);

  return (
    <CanvasContainer width={image.width} height={image.height}>
      <CanvasLayer
        z={1}
        ref={imageCanvasRef}
        width={image.width}
        height={image.height}
      />
      <CanvasLayer
        z={2}
        ref={rectsCanvasRef}
        width={image.width}
        height={image.height}
      />
      <CanvasLayer
        z={3}
        ref={selectCanvasRef}
        width={image.width}
        height={image.height}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseUp}
        onWheel={onWheel}
      />
    </CanvasContainer>
  );
};

export default SelectionCanvas;
