import useKeyPressed from "hooks/useKeyPressed";
import { setFrameOffset } from "lib/sprites";
import { getImageCanvas, mouse2scaledCanvas } from "lib/canvas";
import { wrapi } from "lib/math";
import {
  FC,
  KeyboardEventHandler,
  MouseEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button, ButtonGroup, FormCheck } from "react-bootstrap";
import {
  AiFillPauseCircle,
  AiFillPlayCircle,
  AiFillStepBackward,
  AiFillStepForward,
} from "react-icons/ai";
import useEditorStore from "stores/editorStore";
import useRootStore from "stores/rootStore";
import Editor, { PanelContainer, PanelSection } from "../Editor";
import IntegerInput from "components/IntegerInput/IntegerInput";
import RangeSlider from "./RangeSlider";

function getScale(zoom: number) {
  return Math.pow(1.1, zoom * 2);
}

function inRange(current: number, from: number, to: number, max: number) {
  const start = (from + max) % max;
  const end = to % max;

  if (start > end) {
    return (
      (current >= start && current < max) || (current >= 0 && current <= end)
    );
  } else {
    return current >= start && current <= end;
  }
}

const overrideKey: KeyboardEventHandler = (e) =>
  [" "].includes(e.key) && e.preventDefault();

const AnimationEditor: FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const image = useRootStore((s) => s.getSheet()?.image)!;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const anim = useRootStore((s) => s.getAnimation())!;

  // Editor Display
  const fps = anim.editor.fps;
  const zoom = anim.editor.zoom;
  const playing = anim.editor.playing;
  const no = anim.editor.frameNo;

  const setEditor = useRootStore((s) => s.setAnimationEditor);
  const onZoom = useEditorStore((s) => s.onZoom);

  const togglePlaying = useCallback(
    () => setEditor({ playing: !playing }),
    [playing, setEditor]
  );

  // Shortcuts
  const ctrlKey = useKeyPressed("Control");
  const shiftKey = useKeyPressed("Shift");

  useKeyPressed(" ", togglePlaying);

  useKeyPressed("a", () =>
    setEditor({ frameNo: wrapi(no - 1, 0, anim.frames.length) })
  );
  useKeyPressed("d", () =>
    setEditor({ frameNo: wrapi(no + 1, 0, anim.frames.length) })
  );

  useKeyPressed("ArrowUp", () => setOffset(0, -1), true);
  useKeyPressed("ArrowDown", () => setOffset(0, 1), true);
  useKeyPressed("ArrowLeft", () => setOffset(-1, 0), true);
  useKeyPressed("ArrowRight", () => setOffset(1, 0), true);

  // Action var
  const [showOnionSkin, setShowOnionSkin] = useState(false);
  const [onionSkin, setOnionSkin] = useState({ left: -1, right: 0 });

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
  const imageCanvas = useMemo(() => getImageCanvas(image), [image]);

  // Animation
  const intervalRef = useRef<NodeJS.Timer | undefined>();
  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setEditor({
          frameNo: (no + 1) % anim.frames.length,
        });
      }, 1000 / fps);

      return () => clearInterval(intervalRef.current);
    } else {
      clearInterval(intervalRef.current);
    }
  }, [anim.frames.length, fps, no, playing, setEditor]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frame = anim.frames[no] ?? anim.frames[0];

  const setOffset = useRootStore(
    useCallback(
      (s) => (dx: number, dy: number) => {
        setEditor({ playing: false });

        const frame = anim.frames[no];

        const overflowing = setFrameOffset(dx, dy, anim, no);

        if (ctrlKey) {
          // Move all
          for (let j = 0; j < anim.frames.length; j++) {
            if (no === j) continue;

            setFrameOffset(dx, dy, anim, j);
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
      [anim, ctrlKey, no, setEditor]
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
        x: mousePos.x - anim.frames[no].offset.x,
        y: mousePos.y - anim.frames[no].offset.y,
      };

      setEditor({ playing: false });
    },
    [anim.frames, no, setEditor, zoom]
  );

  const onMouseMove: MouseEventHandler<HTMLCanvasElement> = useCallback(
    (e) => {
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx || !canvasRef.current) return;

      const mousePos = mouse2scaledCanvas(e, canvasRef.current, getScale(zoom));

      if (offsetStart.current && dragStart.current) {
        let offsetX = mousePos.x - offsetStart.current.x;
        let offsetY = mousePos.y - offsetStart.current.y;

        // TODO 90 deg drag kinda buggy
        if (e.shiftKey) {
          const dX = mousePos.x - dragStart.current.x;
          const dY = mousePos.y - dragStart.current.y;

          if (Math.abs(dX - dY) > 1)
            if (Math.abs(dX) > Math.abs(dY)) {
              offsetY = 0;
            } else {
              offsetX = 0;
            }
        }

        const outOfBounds = setOffset(
          offsetX - anim.frames[no].offset.x,
          offsetY - anim.frames[no].offset.y
        );

        if (!e.shiftKey) {
          if (!outOfBounds.left) {
            offsetStart.current.x = mousePos.x - anim.frames[no].offset.x;
          }

          if (!outOfBounds.top) {
            offsetStart.current.y = mousePos.y - anim.frames[no].offset.y;
          }
        }
      }
    },
    [anim.frames, no, setOffset, zoom]
  );

  const onMouseUp: MouseEventHandler<HTMLCanvasElement> = useCallback(
    () => (offsetStart.current = dragStart.current = undefined),
    []
  );

  // Draw
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");

    if (ctx) {
      function drawFrame(f: Frame) {
        ctx &&
          ctx.drawImage(
            imageCanvas,
            f.view.x,
            f.view.y,
            f.view.width,
            f.view.height,
            f.offset.x,
            f.offset.y,
            f.view.width,
            f.view.height
          );
      }

      ctx.canvas.width = size.width;
      ctx.canvas.height = size.height;

      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      // Draw all
      if (ctrlKey) {
        ctx.globalAlpha = 0.2;
        for (const f of anim.frames) {
          drawFrame(f);
        }
      }

      // Draw current
      ctx.globalAlpha = 1.0;
      drawFrame(frame);

      if (
        (onionSkin.left < 0 || onionSkin.right > 0) &&
        (showOnionSkin || shiftKey) &&
        !ctrlKey
      ) {
        ctx.globalAlpha = 0.2;
        for (let i = 0; i < anim.frames.length; i++) {
          if (
            inRange(i, no + onionSkin.left, no, anim.frames.length) ||
            inRange(i, no, no + onionSkin.right, anim.frames.length)
          ) {
            drawFrame(anim.frames[i]);
          }
        }
      }
    }
  }, [
    anim,
    ctrlKey,
    frame,
    imageCanvas,
    no,
    onionSkin.left,
    onionSkin.right,
    showOnionSkin,
    size.height,
    size.width,
    shiftKey,
  ]);

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
                          frameNo: wrapi(no - 1, 0, anim.frames.length),
                        }),
                      [anim.frames.length, no, setEditor]
                    )}
                  >
                    <AiFillStepBackward size={25} />
                  </Button>
                  <Button
                    className="d-flex justify-content-center align-items-center"
                    onClick={togglePlaying}
                    onKeyDown={overrideKey}
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
                          frameNo: wrapi(no + 1, 0, anim.frames.length),
                        }),
                      [anim.frames.length, no, setEditor]
                    )}
                  >
                    <AiFillStepForward size={25} />
                  </Button>
                </ButtonGroup>
              </div>
              <div className="d-flex">
                <span className="me-2 align-middle">FPS:</span>

                <IntegerInput
                  min={1}
                  max={120}
                  value={fps}
                  onChange={(fps) => setEditor({ fps })}
                />
              </div>

              <p>
                Frame: {no + 1} / {anim.frames.length}
              </p>
            </PanelSection>
            <PanelSection header="Positioning">
              {/* <p>
                Mouse: ({Math.floor(mousePos.x) - 1},{" "}
                {Math.floor(mousePos.y) - 1})
              </p> */}
              <p>
                Offsets: ({frame.offset.x}, {frame.offset.y})
              </p>
              {/* <div className="d-flex justify-content-center w-100">
                <DPad
                  onLeft={() => setOffset(-1, 0)}
                  onUp={() => setOffset(0, -1)}
                  onRight={() => setOffset(+1, 0)}
                  onDown={() => setOffset(0, +1)}
                  onUpLeft={() => setOffset(-1, -1)}
                  onUpRight={() => setOffset(+1, -1)}
                  onDownLeft={() => setOffset(-1, +1)}
                  onDownRight={() => setOffset(+1, +1)}
                />
              </div> */}
            </PanelSection>
            {anim.frames.length > 1 && (
              <PanelSection header="Onion Skin">
                <FormCheck
                  label="Show"
                  className="flex-row-reverse form-switch"
                  id="onionSkinCheck"
                  value={showOnionSkin ? 1 : 0}
                  onChange={() => setShowOnionSkin(!showOnionSkin)}
                  onKeyDown={overrideKey}
                />
                <RangeSlider
                  left={onionSkin.left}
                  right={onionSkin.right}
                  onChange={({ left, right }) =>
                    setOnionSkin({
                      left,
                      right,
                    })
                  }
                  min={-Math.ceil(anim.frames.length)}
                  max={Math.ceil(anim.frames.length) - 1}
                />
              </PanelSection>
            )}
          </PanelContainer>
        }
      />
    </>
  );
};

export default AnimationEditor;
