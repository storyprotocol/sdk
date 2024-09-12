import { useCallback, useState } from "react";

type ErrorState<K extends string> = Record<K, string | null>;

const useErrors = <K extends string>(initialState: ErrorState<K>) => {
  const [errors, setErrors] = useState<ErrorState<K>>(initialState);

  const setError = useCallback((key: K, value: string | null) => {
    setErrors((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  return [errors, setError] as const;
};

export { type ErrorState, useErrors };
