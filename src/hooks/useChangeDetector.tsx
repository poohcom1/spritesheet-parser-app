import { useEffect, useRef } from "react";

export default function useChangeDetector<T>(
  variable: T,
  onChange: (previousValue: T, currentValue: T) => void
) {
  const ref = useRef<T>(variable);

  useEffect(() => {
    if (ref.current !== variable) {
      onChange(ref.current, variable);

      ref.current = variable;
    }
  }, [onChange, variable]);
}
