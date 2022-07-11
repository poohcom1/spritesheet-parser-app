import useKeyPressed from "hooks/useKeyPressed";
import { setFrameOffset } from "lib/blob-detection";
import { mouse2scaledCanvas } from "lib/canvas";
import { wrapi } from "lib/math";
import {
  FC,
  MouseEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button, ButtonGroup, FormControl, FormLabel } from "react-bootstrap";
import {
  AiFillPauseCircle,
  AiFillPlayCircle,
  AiFillStepBackward,
  AiFillStepForward,
  AiOutlineMinus,
  AiOutlinePlus,
} from "react-icons/ai";
import useEditorStore from "stores/editorStore";
import useRootStore from "stores/rootStore";
import Editor, { PanelContainer, PanelSection } from "../Editor";
import DPad from "./DPad";

function getScale(zoom: number) {
  return Math.pow(1.1, zoom * 2);
}

const AnimationEditor: FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const image = useRootStore((s) => s.getSheet()?.image)!;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const anim = useRootStore((s) => s.getAnimation())!;

  // Editor Display
  const fps = anim.editor.fps;
  const zoom = anim.editor.zoom;
  const playing = anim.editor.playing;
  const i = anim.editor.frameNo;

  const setEditor = useRootStore((s) => s.setAnimationEditor);
  const onZoom = useEditorStore((s) => s.onZoom);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const togglePlaying = useCallback(
    () => setEditor({ playing: !playing }),
    [playing, setEditor]
  );

  // Shortcuts
  const ctrlKey = useKeyPressed("Control", togglePlaying);

  useKeyPressed(" ", togglePlaying);

  useKeyPressed("a", () =>
    setEditor({ frameNo: wrapi(i - 1, anim.frames.length) })
  );
  useKeyPressed("d", () =>
    setEditor({ frameNo: wrapi(i + 1, anim.frames.length) })
  );

  const upKey = useKeyPressed("ArrowUp");
  const downKey = useKeyPressed("ArrowDown");
  const leftKey = useKeyPressed("ArrowLeft");
  const rightKey = useKeyPressed("ArrowRight");

  // Action var
  const [showAll, setShowAll] = useState(false);
  const [onionSkin, setOnionSkin] = useState<number[]>([]);

  // Zoom
  useEffect(
    () =>
      onZoom(
        () => setEditor({ zoom: zoom + 1 }),
        () => setEditor({ zoom: zoom - 1 })
      ),
    [onZoom, setEditor, zoom]
  );

  const size = anim.size;

  // Init
  const imageCanvas = useMemo(() => {
    const imgCanvas = document.createElement("canvas");
    imgCanvas.width = image.width;
    imgCanvas.height = image.height;
    imgCanvas.getContext("2d")?.putImageData(image, 0, 0);
    return imgCanvas;
  }, [image]);

  // Animation
  const intervalRef = useRef<NodeJS.Timer | undefined>();
  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setEditor({
          frameNo: (i + 1) % anim.frames.length,
        });
      }, 1000 / fps);

      return () => clearInterval(intervalRef.current);
    } else {
      clearInterval(intervalRef.current);
    }
  }, [anim.frames.length, fps, i, playing, setEditor]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frame = anim.frames[i] ?? anim.frames[0];

  const setOffset = useRootStore(
    useCallback(
      (s) => (x: number, y: number) => {
        const frame = anim.frames[i];

        // const minX = -anim.padding.x;
        // const maxX = anim.padding.x + anim.size.width - frame.view.width;

        // const minY = -anim.padding.y;
        // const maxY = anim.padding.y + anim.size.height - frame.view.height;

        const preOffsetX = frame.offset.x;
        const preOffsetY = frame.offset.y;

        // frame.offset.x = Math.min(Math.max(minX, Math.round(x)), maxX);
        // frame.offset.y = Math.min(Math.max(minY, Math.round(y)), maxY);

        const overflowing = setFrameOffset({ x, y }, anim, i);

        if (ctrlKey) {
          const deltaX = frame.offset.x - preOffsetX;
          const deltaY = frame.offset.y - preOffsetY;

          for (let j = 0; j < anim.frames.length; j++) {
            if (i === j) continue;

            const offsetX = deltaX + anim.frames[j].offset.x;
            const offsetY = deltaY + anim.frames[j].offset.y;

            setFrameOffset({ x: offsetX, y: offsetY }, anim, j);
            s.updateAnimation(anim);
          }
        } else {
          s.updateFrame({ offset: frame.offset });
        }

        return {
          left: overflowing.x,
          top: overflowing.y,
        };
      },
      [anim, ctrlKey, i]
    )
  );

  // Editing
  const dragStart = useRef<Point | undefined>();
  const offsetStart = useRef<Point | undefined>();

  const onMouseDown: MouseEventHandler<HTMLCanvasElement> = useCallback(
    (e) => {
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx || !canvasRef.current) return;

      const mousePos = mouse2scaledCanvas(e, canvasRef.current, getScale(zoom));

      dragStart.current = mousePos;
      offsetStart.current = {
        x: mousePos.x - anim.frames[i].offset.x,
        y: mousePos.y - anim.frames[i].offset.y,
      };

      setEditor({ playing: false });
    },
    [anim.frames, i, setEditor, zoom]
  );

  const onMouseMove: MouseEventHandler<HTMLCanvasElement> = useCallback(
    (e) => {
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx || !canvasRef.current) return;

      const mousePos = mouse2scaledCanvas(e, canvasRef.current, getScale(zoom));

      setMousePos(mousePos);

      if (offsetStart.current && dragStart.current) {
        let offsetX = mousePos.x - offsetStart.current.x;
        let offsetY = mousePos.y - offsetStart.current.y;

        // TODO 90 deg drag kinda buggy
        if (e.shiftKey) {
          const dX = mousePos.x - dragStart.current.x;
          const dY = mousePos.y - dragStart.current.y;

          if (Math.abs(dX - dY) > 1)
            if (Math.abs(dX) > Math.abs(dY)) {
              offsetY = anim.frames[i].offset.y;
            } else {
              offsetX = anim.frames[i].offset.x;
            }
        }

        const outOfBounds = setOffset(offsetX, offsetY);

        if (!e.shiftKey) {
          if (!outOfBounds.left) {
            offsetStart.current.x = mousePos.x - anim.frames[i].offset.x;
          }

          if (!outOfBounds.top) {
            offsetStart.current.y = mousePos.y - anim.frames[i].offset.y;
          }
        }
      }
    },
    [anim.frames, i, setOffset, zoom]
  );

  const onMouseUp: MouseEventHandler<HTMLCanvasElement> = useCallback(
    () => (offsetStart.current = dragStart.current = undefined),
    []
  );

  // Draw
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");

    if (ctx) {
      ctx.canvas.width = size.width + anim.padding.x * 2;
      ctx.canvas.height = size.height + anim.padding.y * 2;

      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      if (ctrlKey) {
        ctx.globalAlpha = 0.2;
        for (const f of anim.frames) {
          ctx.drawImage(
            imageCanvas,
            f.view.x,
            f.view.y,
            f.view.width,
            f.view.height,
            f.offset.x + anim.padding.x,
            f.offset.y + anim.padding.y,
            f.view.width,
            f.view.height
          );
        }
      }

      ctx.globalAlpha = 1.0;
      ctx.drawImage(
        imageCanvas,
        frame.view.x,
        frame.view.y,
        frame.view.width,
        frame.view.height,
        frame.offset.x + anim.padding.x,
        frame.offset.y + anim.padding.y,
        frame.view.width,
        frame.view.height
      );
    }
  }, [anim, ctrlKey, frame, imageCanvas, showAll, size.height, size.width]);

  return (
    <>
      <Editor
        screenElement={
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ width: "100%", height: "100%" }}
            onWheel={(e) => setEditor({ zoom: zoom - Math.sign(e.deltaY) })}
          >
            <canvas
              style={{
                transform: `scale(${getScale(zoom)})`,
                flexGrow: "0",
                flexShrink: "0",
                border: "1px solid black",
                zIndex: 1,
              }}
              ref={canvasRef}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
            />
          </div>
        }
        panelElement={
          <PanelContainer title="Animation Inspector">
            <PanelSection header="Player">
              <div className="d-flex justify-content-center">
                <ButtonGroup className="w-75 h-25 mb-3">
                  <Button
                    className="d-flex justify-content-center align-items-center"
                    onClick={useCallback(
                      () =>
                        setEditor({
                          frameNo: wrapi(i - 1, anim.frames.length),
                        }),
                      [anim.frames.length, i, setEditor]
                    )}
                  >
                    <AiFillStepBackward size={25} />
                  </Button>
                  <Button
                    className="d-flex justify-content-center align-items-center"
                    onClick={togglePlaying}
                  >
                    {playing ? (
                      <AiFillPauseCircle size={25} />
                    ) : (
                      <AiFillPlayCircle size={25} />
                    )}
                  </Button>
                  <Button
                    className="d-flex justify-content-center align-items-center"
                    onClick={useCallback(
                      () =>
                        setEditor({
                          frameNo: wrapi(i + 1, anim.frames.length),
                        }),
                      [anim.frames.length, i, setEditor]
                    )}
                  >
                    <AiFillStepForward size={25} />
                  </Button>
                </ButtonGroup>
              </div>
              <FormLabel htmlFor="fps" className="me-2">
                FPS:
              </FormLabel>
              <ButtonGroup>
                <Button
                  onClick={() => setEditor({ fps: Math.max(fps - 1, 1) })}
                >
                  <AiOutlineMinus />
                </Button>
                <FormControl
                  id="fps"
                  style={{ width: "50px", borderRadius: 0 }}
                  type="text"
                  inputMode="numeric"
                  min={1}
                  max={120}
                  value={fps}
                  onChange={(e) => setEditor({ fps: parseInt(e.target.value) })}
                />
                <Button
                  onClick={() => setEditor({ fps: Math.min(fps + 1, 120) })}
                >
                  <AiOutlinePlus />
                </Button>
              </ButtonGroup>
              <p>
                Frame: {i} / {anim.frames.length - 1}
              </p>
            </PanelSection>
            <PanelSection header="Positioning">
              <p>
                Mouse: ({Math.floor(mousePos.x) - 1},{" "}
                {Math.floor(mousePos.y) - 1})
              </p>
              <p>
                Offsets: ({frame.offset.x + anim.padding.x},{" "}
                {frame.offset.y + anim.padding.y})
              </p>
              <DPad
                onLeft={() => setOffset(frame.offset.x - 1, frame.offset.y)}
                onUp={() => setOffset(frame.offset.x, frame.offset.y - 1)}
                onRight={() => setOffset(frame.offset.x + 1, frame.offset.y)}
                onDown={() => setOffset(frame.offset.x, frame.offset.y + 1)}
                onUpLeft={() =>
                  setOffset(frame.offset.x - 1, frame.offset.y - 1)
                }
                onUpRight={() =>
                  setOffset(frame.offset.x + 1, frame.offset.y - 1)
                }
                onDownLeft={() =>
                  setOffset(frame.offset.x - 1, frame.offset.y + 1)
                }
                onDownRight={() =>
                  setOffset(frame.offset.x + 1, frame.offset.y + 1)
                }
              />
            </PanelSection>
          </PanelContainer>
        }
      />
    </>
  );
};

export default AnimationEditor;
