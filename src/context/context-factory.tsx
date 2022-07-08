import { FC, createContext, ReactNode, useState, useCallback } from "react";

interface ContextType<T> {
  value: T;
  setValue(newState: Partial<T>): void;
  dispatch<K extends keyof T>(key: K, value: T[K]): void;
}

export default function generateContext<T>(initialState: T) {
  const Context = createContext<ContextType<T>>({
    value: initialState,
    setValue: () => initialState,
    dispatch: (_key, _value) => undefined,
  });

  const Provider: FC<{ children?: ReactNode }> = ({ children }) => {
    const [state, setState] = useState<T>(initialState);

    const setParialState = useCallback(
      (newState: Partial<T>) => {
        setState({ ...state, ...newState });
        return { ...state, ...newState };
      },
      [state]
    );

    const dispatch = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
      setState((state) => ({ ...state, [key]: value }));
    }, []);

    return (
      <Context.Provider
        value={{
          value: state,
          setValue: setParialState,
          dispatch,
        }}
      >
        {children}
      </Context.Provider>
    );
  };

  return {
    Context,
    Provider,
  };
}
