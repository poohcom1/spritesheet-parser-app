import { FC, useCallback, useEffect, useState } from "react";
import { Rect } from "blob-detection-ts";
import Editor, { PanelSection } from "../Editor";
import SelectionCanvas from "./SelectionCanvas";
import { Button, ButtonGroup } from "react-bootstrap";
import { mergeRects } from "../../lib/blob-detection";
import { FaUndo as UndoIcon, FaRedo as RedoIcon } from "react-icons/fa";
import useHistory from "../../hooks/useHistory";

interface SheetEditorProps {
  sheet: Sheet | undefined;
  onAnimationCreated(rects: Rect[]): void;
}

const SheetEditor: FC<SheetEditorProps> = ({ sheet, onAnimationCreated }) => {
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
    if (sheet) setInitial(sheet.rects);
  }, [setInitial, sheet]);

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

  const animationCreated = useCallback(() => {
    onAnimationCreated(selected);
    setSelected([]);
  }, [onAnimationCreated, selected]);

  if (sheet) {
    return (
      <Editor
        screenElement={
          <SelectionCanvas
            onSelect={setSelected}
            image={sheet.image}
            rects={rects}
            selectedRects={selected}
          />
        }
        panelElement={
          <>
            <h4>Sheet Inspector</h4>
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
                onClick={animationCreated}
              >
                Create Animation
              </Button>
            </PanelSection>
            <PanelSection header={"Selection"}>
              <p>Selected sprites: {selected.length}</p>
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
                  onClick={() => {
                    undo();
                    setSelected([]);
                  }}
                >
                  <UndoIcon />
                </Button>
                <Button
                  title="Redo"
                  variant="dark"
                  disabled={!canRedo}
                  onClick={() => {
                    redo();
                    setSelected([]);
                  }}
                >
                  <RedoIcon />
                </Button>
                <Button
                  variant="dark"
                  onClick={() => {
                    reset();
                    setSelected([]);
                  }}
                >
                  Reset
                </Button>
              </ButtonGroup>
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
