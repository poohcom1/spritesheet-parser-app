import { mouse2scaledCanvas } from "lib/canvas";
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
        setEditor({ frameNo: i + 1 >= anim.frames.length ? 0 : i + 1 });
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

        const minX = -anim.padding.x;
        const maxX = anim.padding.x + anim.size.width - frame.position.width;

        const minY = -anim.padding.y;
        const maxY = anim.padding.y + anim.size.height - frame.position.height;

        frame.offset.left = Math.min(Math.max(minX, Math.floor(x)), maxX);
        frame.offset.top = Math.min(Math.max(minY, Math.floor(y)), maxY);

        s.updateFrame({ offset: frame.offset });

        return {
          left: x >= minX && x <= maxX,
          top: y >= minY && y <= maxY,
        };
      },
      [anim, i]
    )
  );

  // Editing
  const dragStart = useRef<Point | undefined>();

  const onMouseDown: MouseEventHandler<HTMLCanvasElement> = useCallback(
    (e) => {
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx || !canvasRef.current) return;

      const mousePos = mouse2scaledCanvas(e, canvasRef.current, getScale(zoom));

      dragStart.current = {
        x: mousePos.x - anim.frames[i].offset.left,
        y: mousePos.y - anim.frames[i].offset.top,
      };
    },
    [anim.frames, i, zoom]
  );

  const onMouseMove: MouseEventHandler<HTMLCanvasElement> = useCallback(
    (e) => {
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx || !canvasRef.current) return;

      const mousePos = mouse2scaledCanvas(e, canvasRef.current, getScale(zoom));

      setMousePos(mousePos);

      if (dragStart.current) {
        const deltaX = mousePos.x - dragStart.current.x;
        const deltaY = mousePos.y - dragStart.current.y;

        const offsetChanged = setOffset(deltaX, deltaY);

        if (!offsetChanged.left) {
          dragStart.current.x = mousePos.x - anim.frames[i].offset.left;
        }

        if (!offsetChanged.top) {
          dragStart.current.y = mousePos.y - anim.frames[i].offset.top;
        }
      }
    },
    [anim.frames, i, setOffset, zoom]
  );

  const onMouseUp: MouseEventHandler<HTMLCanvasElement> = useCallback(
    () => (dragStart.current = undefined),
    []
  );

  // Drawing
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");

    if (ctx) {
      ctx.canvas.width = size.width + anim.padding.x * 2;
      ctx.canvas.height = size.height + anim.padding.y * 2;

      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.drawImage(
        imageCanvas,
        frame.position.x,
        frame.position.y,
        frame.position.width,
        frame.position.height,
        frame.offset.left + anim.padding.x,
        frame.offset.top + anim.padding.y,
        frame.position.width,
        frame.position.height
      );
    }
  }, [anim, frame, imageCanvas, size.height, size.width]);

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
                          frameNo: i - 1 >= 0 ? i - 1 : anim.frames.length - 1,
                        }),
                      [anim.frames.length, i, setEditor]
                    )}
                  >
                    <AiFillStepBackward size={25} />
                  </Button>
                  <Button
                    className="d-flex justify-content-center align-items-center"
                    onClick={() => setEditor({ playing: !playing })}
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
                          frameNo: i + 1 < anim.frames.length ? i + 1 : 0,
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
              <p>Frame: {i}</p>
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
