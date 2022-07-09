import { getFramesSize } from "lib/blob-detection";
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, ButtonGroup, FormControl, FormLabel } from "react-bootstrap";
import {
  AiFillPauseCircle,
  AiFillPlayCircle,
  AiFillStepBackward,
  AiFillStepForward,
  AiOutlineMinus,
  AiOutlinePlus,
} from "react-icons/ai";
import useDisplayStore from "stores/displayStore";
import useRootStore from "stores/rootStore";
import Editor, { PanelContainer, PanelSection } from "../Editor";
import DPad from "./DPad";

const AnimationEditor: FC = () => {
  const image = useRootStore((s) => s.getSheet()?.image);
  const animation = useRootStore((s) => s.getAnimation())!;

  // Display
  const onZoom = useDisplayStore((s) => s.onZoom);

  const zoom = animation.display.zoom;
  const setZoom = useRootStore(
    (s) => (zoom: number) => s.setAnimationDisplay({ zoom })
  );

  useEffect(() => {
    onZoom(
      () => setZoom(zoom + 1),
      () => setZoom(zoom - 1)
    );
  }, [onZoom, setZoom, zoom]);

  const [fps, setFps] = useState(12);

  // Animation
  const [size, setSize] = useState({ width: 0, height: 0 });

  const [playing, setPlaying] = useState(true);
  const [i, setI] = useState(0);

  // Init
  useEffect(() => setSize(getFramesSize(animation.frames)), [animation.frames]);

  const imageCanvas = useMemo(() => {
    if (image) {
      const imgCanvas = document.createElement("canvas");
      imgCanvas.width = image.width;
      imgCanvas.height = image.height;
      imgCanvas.getContext("2d")?.putImageData(image, 0, 0);
      return imgCanvas;
    } else return undefined;
  }, [image]);

  // Animation
  const intervalRef = useRef<NodeJS.Timer | undefined>();
  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setI(i + 1 >= animation.frames.length ? 0 : i + 1);
      }, 1000 / fps);

      return () => clearInterval(intervalRef.current);
    } else {
      clearInterval(intervalRef.current);
    }
  }, [animation.frames.length, fps, i, playing]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frame = animation.frames[i] ?? animation.frames[0];

  const setOffset = useRootStore(
    useCallback(
      (s) => (x: number, y: number) => {
        const frame = animation.frames[i];
        frame.offset.left = x;
        frame.offset.top = y;

        s.editAnimation(animation);
      },
      [animation, i]
    )
  );

  const ctx = canvasRef.current?.getContext("2d");

  if (ctx && imageCanvas) {
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

  return (
    <>
      <Editor
        screenElement={
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ width: "100%", height: "100%" }}
            onWheel={(e) => setZoom(zoom - Math.sign(e.deltaY))}
          >
            <canvas
              style={{
                transform: `scale(${Math.pow(1.1, zoom * 2)})`,
                flexGrow: "0",
                flexShrink: "0",
                border: "1px solid black",
              }}
              ref={canvasRef}
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
                        setI(i - 1 >= 0 ? i - 1 : animation.frames.length - 1),
                      [animation.frames.length, i]
                    )}
                  >
                    <AiFillStepBackward size={25} />
                  </Button>
                  <Button
                    className="d-flex justify-content-center align-items-center"
                    onClick={() => setPlaying(!playing)}
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
                      () => setI(i + 1 < animation.frames.length ? i + 1 : 0),
                      [animation.frames.length, i]
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
                <Button onClick={() => setFps(Math.max(fps - 1, 1))}>
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
                  onChange={(e) => setFps(parseInt(e.target.value))}
                />
                <Button onClick={() => setFps(Math.min(fps + 1, 120))}>
                  <AiOutlinePlus />
                </Button>
              </ButtonGroup>
              <p>Frame: {i}</p>
            </PanelSection>
            <PanelSection header="Positioning">
              <p>
                Offsets: ({frame.offset.x}, {frame.offset.y})
              </p>
              <DPad
                onLeft={() => setOffset(frame.offset.x - 1, frame.offset.y)}
                onUp={() => setOffset(frame.offset.x, frame.offset.y - 1)}
                onRight={() => setOffset(frame.offset.x + 1, frame.offset.y)}
                onDown={() => setOffset(frame.offset.x, frame.offset.y + 1)}
              />
            </PanelSection>
          </PanelContainer>
        }
      />
    </>
  );
};

export default AnimationEditor;
