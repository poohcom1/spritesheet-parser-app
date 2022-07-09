import {
  forwardRef,
  ForwardRefRenderFunction,
  HTMLProps,
  useEffect,
  useRef,
  useState,
} from "react";
import { assignRefs } from "../../lib/jsx";

const FitCanvas: ForwardRefRenderFunction<
  HTMLCanvasElement,
  Omit<HTMLProps<HTMLCanvasElement>, "width" | "height">
> = (props, ref) => {
  const localRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const canvas = localRef.current;
    if (canvas) {
      setSize({
        width: canvas.offsetWidth,
        height: canvas.offsetHeight,
      });
    }
  }, []);

  return (
    <canvas
      style={{ height: "100%", width: "100%" }}
      width={size.width}
      height={size.height}
      ref={assignRefs(ref, localRef)}
      {...props}
    />
  );
};

export default forwardRef(FitCanvas);
