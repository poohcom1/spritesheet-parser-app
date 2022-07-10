import { mouse2canvas } from "lib/canvas";
import {
  FC,
  MouseEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
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

const AnimationEditor: FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const image = useRootStore((s) => s.getSheet()?.image)!;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const animation = useRootStore((s) => s.getAnimation())!;

  // Editor Display
  const fps = animation.editor.fps;
  const zoom = animation.editor.zoom;
  const playing = animation.editor.playing;
  const i = animation.editor.frameNo;

  const setEditor = useRootStore((s) => s.setAnimationEditor);
  const onZoom = useEditorStore((s) => s.onZoom);

  useEffect(
    () =>
      onZoom(
        () => setEditor({ zoom: zoom + 1 }),
        () => setEditor({ zoom: zoom - 1 })
      ),
    [onZoom, setEditor, zoom]
  );

  const size = animation.size;

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
        setEditor({ frameNo: i + 1 >= animation.frames.length ? 0 : i + 1 });
      }, 1000 / fps);

      return () => clearInterval(intervalRef.current);
    } else {
      clearInterval(intervalRef.current);
    }
  }, [animation.frames.length, fps, i, playing, setEditor]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frame = animation.frames[i] ?? animation.frames[0];

  const setOffset = useRootStore(
    useCallback(
      (s) => (x: number, y: number) => {
        const frame = animation.frames[i];

        frame.offset.left = Math.min(
          Math.max(-animation.padding.x, Math.floor(x)),
          animation.padding.x + animation.size.width - frame.position.width
        );
        frame.offset.top = Math.min(
          Math.max(-animation.padding.y, Math.floor(y)),
          animation.padding.y + animation.size.height - frame.position.height
        );

        s.updateFrame({ offset: frame.offset });
      },
      [animation, i]
    )
  );

  // Editing
  const dragPos = useRef<Point | undefined>();

  const onMouseDown: MouseEventHandler<HTMLCanvasElement> = useCallback((e) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !canvasRef.current) return;

    dragPos.current = mouse2canvas(e, canvasRef.current);
  }, []);

  const onMouseMove: MouseEventHandler<HTMLCanvasElement> = useCallback(
    (e) => {
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx || !canvasRef.current) return;

      if (dragPos.current) {
        const mousePos = mouse2canvas(e, canvasRef.current);
        const deltaX = mousePos.x - dragPos.current.x;
        const deltaY = mousePos.y - dragPos.current.y;

        setOffset(frame.offset.x + deltaX, frame.offset.y + deltaY);

        dragPos.current = mousePos;
      }
    },
    [frame.offset.x, frame.offset.y, setOffset]
  );

  const onMouseUp: MouseEventHandler<HTMLCanvasElement> = useCallback(
    () => (dragPos.current = undefined),
    []
  );

  // Drawing
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");

    if (ctx) {
      ctx.canvas.width = size.width + animation.padding.x * 2;
      ctx.canvas.height = size.height + animation.padding.y * 2;

      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.drawImage(
        imageCanvas,
        frame.position.x,
        frame.position.y,
        frame.position.width,
        frame.position.height,
        frame.offset.left + animation.padding.x,
        frame.offset.top + animation.padding.y,
        frame.position.width,
        frame.position.height
      );
    }
  }, [animation, frame, imageCanvas, size.height, size.width]);

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
                transform: `scale(${Math.pow(1.1, zoom * 2)})`,
                flexGrow: "0",
                flexShrink: "0",
                border: "1px solid black",
              }}
              ref={canvasRef}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
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
                          frameNo:
                            i - 1 >= 0 ? i - 1 : animation.frames.length - 1,
                        }),
                      [animation.frames.length, i, setEditor]
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
                          frameNo: i + 1 < animation.frames.length ? i + 1 : 0,
                        }),
                      [animation.frames.length, i, setEditor]
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
                Offsets: ({frame.offset.x + animation.padding.x},{" "}
                {frame.offset.y + animation.padding.y})
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
