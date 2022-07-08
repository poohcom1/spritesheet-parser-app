import {
  FC,
  createContext,
  ReactNode,
  useState,
  useCallback,
  Dispatch,
} from "react";

type SetPartialStateAction<S> = Partial<S> | ((prevState: S) => Partial<S>);

interface ContextType<T> {
  value: T;
  setValue: Dispatch<SetPartialStateAction<T>>;
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

    const setPartialState = useCallback(
      (action: SetPartialStateAction<T>) => {
        if (typeof action === "function") {
          const newState = (action as (s: T) => T)(state);
          const updatedState = { ...state, ...newState };

          setState(updatedState);

          return updatedState;
        } else {
          const updatedState = { ...state, ...action };

          setState(updatedState);

          return updatedState;
        }
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
          setValue: setPartialState,
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
