import {
  FC,
  MouseEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  WheelEventHandler,
} from "react";
import styled from "styled-components";
import MSER, { Rect } from "blob-detection-ts";
import useEditorStore from "stores/editorStore";
import { TransformContext } from "canvas-transform-context";

const CanvasLayer = styled.canvas<{ z: number }>`
  position: absolute;
  z-index: ${(props) => props.z};
`;

const CanvasContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
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
  // Editor context
  const onZoom = useEditorStore((s) => s.onZoom);

  const imageCanvasRef = useRef<HTMLCanvasElement>(null);
  const rectsCanvasRef = useRef<HTMLCanvasElement>(null);
  const selectCanvasRef = useRef<HTMLCanvasElement>(null);

  const imageCtxRef = useRef<TransformContext | undefined>();
  const rectsCtxRef = useRef<TransformContext | undefined>();
  const selectCtxRef = useRef<TransformContext | undefined>();

  const anchorRef = useRef<Point | undefined>();
  const [selection, setSelection] = useState<Rect>(new Rect());

  // Init ctx
  useEffect(() => {
    const i_ctx = imageCanvasRef.current?.getContext("2d");
    const r_ctx = rectsCanvasRef.current?.getContext("2d");
    const s_ctx = selectCanvasRef.current?.getContext("2d");

    if (i_ctx && !imageCtxRef.current) {
      imageCtxRef.current = new TransformContext(i_ctx);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (i_ctx as any).webkitImageSmoothingEnabled = false;
      i_ctx.imageSmoothingEnabled = false;
    }
    if (r_ctx && !rectsCtxRef.current)
      rectsCtxRef.current = new TransformContext(r_ctx);
    if (s_ctx && !selectCtxRef.current)
      selectCtxRef.current = new TransformContext(s_ctx);
  }, []);

  // Memos
  const imageData = useMemo(() => {
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

    return canvas;
  }, [image.data, image.height, image.width, rects]);

  // Draw functions
  const drawImage = useCallback(() => {
    const t_ctx = imageCtxRef.current;
    if (!t_ctx) return;
    const ctx = t_ctx.ctx;

    t_ctx.clearCanvas();

    ctx.drawImage(imageData, 0, 0);
  }, [imageData]);

  const drawRects = useCallback(() => {
    const t_ctx = rectsCtxRef.current;
    if (!t_ctx) return;
    const ctx = t_ctx.ctx;

    t_ctx.clearCanvas();
    selectedRects.forEach((rect) => {
      ctx.fillStyle = "#ff000055";
      ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    });
  }, [selectedRects]);

  const preSelection = useRef(new Rect());

  const drawSelection = useCallback(() => {
    const t_ctx = selectCtxRef.current;
    if (!t_ctx) return;
    const ctx = t_ctx.ctx;

    ctx.clearRect(
      preSelection.current.x - 5,
      preSelection.current.y - 5,
      preSelection.current.width + 10,
      preSelection.current.height + 10
    );
    ctx.fillStyle = "#ff0000aa";
    if (selection.width > 0 && selection.height > 0) {
      ctx.fillRect(selection.x, selection.y, selection.width, selection.height);
      preSelection.current = selection;
    }
  }, [selection]);

  const contexts = useCallback(
    () => [imageCtxRef.current, rectsCtxRef.current, selectCtxRef.current],
    []
  );

  const drawAll = useCallback(() => {
    drawImage();
    drawRects();
    drawSelection();
  }, [drawImage, drawRects, drawSelection]);

  const withContexts = useCallback(
    (callback: (ctx: TransformContext) => void) => {
      for (const ctx of contexts()) if (ctx) callback(ctx);
      drawAll();
    },
    [contexts, drawAll]
  );

  useEffect(drawAll, [drawAll]);

  const onMouseDown: MouseEventHandler<HTMLCanvasElement> = useCallback(
    (e) => {
      if (e.ctrlKey || e.metaKey) {
        withContexts((ctx) => ctx.beginMousePan(e.nativeEvent));
      } else {
        if (selectCtxRef.current) {
          const mousePos = selectCtxRef.current.mouseToTransformed(
            e.nativeEvent
          );
          anchorRef.current = mousePos;

          onSelect([]);
          for (const rect of rects) {
            if (rect.intersect(new Rect(mousePos.x, mousePos.y, 1, 1))) {
              onSelect([rect]);

              break;
            }
          }
        }
      }
    },
    [onSelect, rects, withContexts]
  );

  const onMouseMove: MouseEventHandler<HTMLCanvasElement> = useCallback(
    (e) => {
      if (!(e.ctrlKey || e.metaKey)) {
        if (selectCtxRef.current && anchorRef.current) {
          const begin = anchorRef.current;
          const end = selectCtxRef.current.mouseToTransformed(e.nativeEvent);

          const width = Math.abs(begin.x - end.x);
          const height = Math.abs(begin.y - end.y);
          const left = Math.min(begin.x, end.x);
          const top = Math.min(begin.y, end.y);

          // Calculate selection
          const selection = new Rect(left, top, width, height);
          const intersects: Rect[] = [];

          for (const rect of rects) {
            const intersection = selection.intersect(rect);
            if (intersection) {
              intersects.push(rect);
            }
          }

          setSelection(selection);
          onSelect(intersects);
        }
      } else {
        withContexts((ctx) => ctx.moveMousePan(e.nativeEvent));
      }
    },
    [onSelect, rects, withContexts]
  );

  const onMouseUp: MouseEventHandler<HTMLCanvasElement> = useCallback(() => {
    withContexts((ctx) => ctx.endMousePan());

    anchorRef.current = undefined;
    setSelection(new Rect(0, 0, 0, 0));
    drawSelection();
  }, [drawSelection, withContexts]);

  const onWheel: WheelEventHandler<HTMLCanvasElement> = useCallback(
    (e) => withContexts((ctx) => ctx.zoomByMouse(e.nativeEvent)),
    [withContexts]
  );

  useEffect(
    () =>
      onZoom(
        () => withContexts((ctx) => ctx.zoomBy(1)),
        () => withContexts((ctx) => ctx.zoomBy(-1))
      ),
    [contexts, onZoom, withContexts]
  );

  const [canvasSize, setCanvasSize] = useState({ width: 1920, height: 1080 });

  useEffect(() => {
    setCanvasSize({
      width: window.screen.width ?? window.innerWidth,
      height: window.screen.height ?? window.innerHeight,
    });
  }, []);

  return (
    <CanvasContainer>
      <CanvasLayer z={1} ref={imageCanvasRef} {...canvasSize} />
      <CanvasLayer z={2} ref={rectsCanvasRef} {...canvasSize} />
      <CanvasLayer
        z={3}
        ref={selectCanvasRef}
        {...canvasSize}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
        onMouseEnter={() =>
          document.addEventListener("wheel", preventZoom, {
            passive: false,
          })
        }
        onMouseLeave={(e) => {
          document.removeEventListener("wheel", preventZoom);
          onMouseUp(e);
        }}
        onWheel={onWheel}
      />
    </CanvasContainer>
  );
};

const preventZoom = (e: WheelEvent) => e.ctrlKey && e.preventDefault();

export default SelectionCanvas;
