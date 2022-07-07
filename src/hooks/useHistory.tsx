import { useCallback, useMemo, useState } from "react";

export default function useHistory<T>(initial: T) {
  const [history, setHistory] = useState([initial]);
  const [redoStack, setRedoStack] = useState<T[]>([]);

  const setInitial = useCallback((initial: T) => {
    setHistory([initial]);
  }, []);

  const push: (state: T) => T = useCallback(
    (state: T) => {
      setHistory([...history, state]);
      setRedoStack([]);

      return state;
    },
    [history]
  );

  const undo: () => T = useCallback(() => {
    if (history.length > 1) {
      const remove = history.pop();

      if (!remove) {
        throw new Error();
      }

      redoStack.push(remove);

      setRedoStack([...redoStack]);
      setHistory([...history]);

      return history[history.length - 1];
    } else {
      return history[0];
    }
  }, [history, redoStack]);

  const redo: () => T | undefined = useCallback(() => {
    const s = redoStack.pop();

    if (s) {
      history.push(s);
      setHistory([...history]);
    }

    setRedoStack([...redoStack]);

    return s;
  }, [history, redoStack]);

  const reset: () => T = useCallback(() => {
    setRedoStack([...redoStack, ...history]);

    setHistory(history.slice(0, 1));

    return history[0];
  }, [history, redoStack]);

  const current: T = useMemo(() => history[history.length - 1], [history]);
  const canUndo = useMemo(() => history.length > 1, [history]);
  const canRedo = useMemo(() => redoStack.length > 0, [redoStack]);

  return {
    current,
    push,
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
    setInitial,
  };
}
