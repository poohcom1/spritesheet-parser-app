import { forwardRef, HTMLProps } from "react";

interface EditorCanvasProps {
  zoom: number;
}

const EditorCanvas = forwardRef<
  HTMLCanvasElement,
  HTMLProps<HTMLCanvasElement> & EditorCanvasProps
>(function PureEditorCanvas({ ...props }, ref) {
  return (
    <>
      <canvas ref={ref} {...props} />
    </>
  );
});

export default EditorCanvas;
