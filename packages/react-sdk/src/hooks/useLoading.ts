import { useCallback, useState } from "react";

type LoadingState<K extends string> = Record<K, boolean>;

const useLoading = <K extends string>(initialState: LoadingState<K>) => {
  const [loadings, setLoadings] = useState<LoadingState<K>>(initialState);

  const setLoading = useCallback((key: K, value: boolean) => {
    setLoadings((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  return [loadings, setLoading] as const;
};

export { type LoadingState, useLoading };
