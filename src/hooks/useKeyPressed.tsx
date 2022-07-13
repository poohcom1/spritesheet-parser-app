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
    ({ preventDefault, key, repeat }: KeyboardEvent) => {
      if (
        key.toLocaleLowerCase() === targetKey.toLocaleLowerCase() &&
        (!repeat || allowRepeat)
      ) {
        callbackRef.current();
        setKeyPressed(true);
        preventDefault();
      }
    },
    [allowRepeat, targetKey]
  );
  const upHandler = useCallback(
    ({ preventDefault, key }: KeyboardEvent): void => {
      if (key.toLocaleLowerCase() === targetKey.toLocaleLowerCase()) {
        setKeyPressed(false);
        preventDefault();
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
