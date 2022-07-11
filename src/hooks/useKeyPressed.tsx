import { useState, useEffect, useCallback, useRef } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Callback = () => any;

/**
 * @see https://usehooks.com/useKeyPress/
 * @param targetKey
 * @returns
 */
export default function useKeyPressed(
  targetKey: string,
  onKeyPress: Callback = () => undefined,
  allowRepeat = false
): boolean {
  const [keyPressed, setKeyPressed] = useState(false);

  const callbackRef = useRef(onKeyPress);

  useEffect(() => {
    callbackRef.current = onKeyPress;
  }, [onKeyPress]);

  const downHandler = useCallback(
    ({ key, repeat }: KeyboardEvent) => {
      if (key === targetKey && (!repeat || allowRepeat)) {
        callbackRef.current();
        setKeyPressed(true);
      }
    },
    [allowRepeat, targetKey]
  );
  const upHandler = useCallback(
    ({ key }: KeyboardEvent): void => {
      if (key === targetKey) {
        setKeyPressed(false);
      }
    },
    [targetKey]
  );
  // Add event listeners
  useEffect(() => {
    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);
    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty array ensures that effect is only run on mount and unmount
  return keyPressed;
}
