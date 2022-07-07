import { FC, useCallback, useEffect, useState } from "react";
import MSER, { MSEROptions, Rect } from "blob-detection-ts";
import Editor, { PanelSection } from "../Editor";
import SelectionCanvas from "../../components/SelectionCanvas/SelectionCanvas";
import { getBinaryImage } from "../../lib/image";
import { Button, ButtonGroup } from "react-bootstrap";
import { mergeRects } from "../../lib/blob-detection";
import { FaUndo as UndoIcon, FaRedo as RedoIcon } from "react-icons/fa";
import useHistory from "../../hooks/useHistory";

const DEFAULT_OPTIONS = {
  delta: 0,
  minArea: 0,
  maxArea: 0.5,
  maxVariation: 0.5,
  minDiversity: 0.33,
};

interface SheetEditorProps {
  image: ImageData | undefined;
  onAnimationCreated(rects: Rect[]): void;
}

function blobDetection(
  image: ImageData | undefined,
  options: MSEROptions = DEFAULT_OPTIONS
): Rect[] {
  if (!image) return [];

  const imgData = new ImageData(
    new Uint8ClampedArray(image.data),
    image.width,
    image.height
  );
  const binaryImgData = getBinaryImage(imgData);
  const mser = new MSER(options);

  let rects = mser.extract(binaryImgData).map((r) => r.rect);

  rects = mser.mergeRects(rects);

  return rects;
}

const SheetEditor: FC<SheetEditorProps> = ({ image, onAnimationCreated }) => {
  const [MSEROptions, _setMSEROptions] = useState<MSEROptions>(DEFAULT_OPTIONS);

  const {
    current: rects,
    redo,
    undo,
    push,
    reset,
    setInitial,
    canUndo,
    canRedo,
  } = useHistory<Rect[]>([]);

  useEffect(() => {
    setInitial(blobDetection(image, MSEROptions));
  }, [MSEROptions, image, setInitial]);

  const [selected, setSelected] = useState<Rect[]>([]);

  const mergeSelected = useCallback(() => {
    if (selected.length === 0) {
      console.error("No rects selected!");
      return;
    }
    const newRects = rects.filter((rect) => !selected.includes(rect));
    const merged = mergeRects(selected);
    newRects.push(merged);

    setSelected([]);

    push(newRects);
  }, [push, rects, selected]);

  const animationedCreated = useCallback(() => {
    onAnimationCreated(selected);
    setSelected([]);
  }, [onAnimationCreated, selected]);

  if (image) {
    return (
      <Editor
        screenElement={
          <SelectionCanvas
            onSelect={setSelected}
            image={image}
            rects={rects}
            selectedRects={selected}
          />
        }
        panelElement={
          <>
            <h4>Sheet Inspector</h4>
            <PanelSection header={"Selection"}>
              <p>Selected blobs: {selected.length}</p>
              <ButtonGroup>
                <Button
                  variant="secondary"
                  disabled={selected.length === 0}
                  onClick={mergeSelected}
                >
                  Merge Rect
                </Button>
                <Button
                  title="Undo"
                  variant="dark"
                  disabled={!canUndo}
                  onClick={() => undo()}
                >
                  <UndoIcon />
                </Button>
                <Button
                  title="Redo"
                  variant="dark"
                  disabled={!canRedo}
                  onClick={() => redo()}
                >
                  <RedoIcon />
                </Button>
                <Button variant="dark" onClick={() => reset()}>
                  Reset
                </Button>
              </ButtonGroup>
            </PanelSection>
            <PanelSection header="Animation">
              <Button
                variant="secondary"
                className="w-100"
                title={
                  selected.length === 0
                    ? "Please selected one or more sprites to create an animation"
                    : "Create an animation with selected sprites"
                }
                disabled={selected.length === 0}
                onClick={animationedCreated}
              >
                Create Animation
              </Button>
            </PanelSection>
          </>
        }
      />
    );
  } else {
    return <></>;
  }
};

export default SheetEditor;
