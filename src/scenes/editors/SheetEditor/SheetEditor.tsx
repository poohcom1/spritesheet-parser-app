import { FC, useCallback, useEffect, useState } from "react";
import { Rect } from "blob-detection-ts";
import { FaUndo as UndoIcon, FaRedo as RedoIcon } from "react-icons/fa";
import Editor, { PanelContainer, PanelSection } from "../Editor";
import SelectionCanvas from "./SelectionCanvas";
import { Button, ButtonGroup } from "react-bootstrap";
import { mergeRects } from "lib/sprites";
import useHistory from "hooks/useHistory";
import useChangeDetector from "hooks/useChangeDetector";
import useRootStore from "stores/rootStore";

const SheetEditor: FC = () => {
  const sheet = useRootStore((s) => s.getSheet());
  const addAnimation = useRootStore((s) => s.addAnimation);

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

  useChangeDetector(sheet, () => {
    setSelected([]);
  });

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
    addAnimation(selected);
    setSelected([]);
  }, [addAnimation, selected]);

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
          <PanelContainer title="Sheet Inspector">
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
          </PanelContainer>
        }
      />
    );
  } else {
    return <></>;
  }
};

export default SheetEditor;
