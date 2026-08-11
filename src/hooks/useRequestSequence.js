import { useRef, useCallback } from "react";

/**
 * Evita race condition em fetches disparados por troca rápida de abas/filtros.
 * Só a última chamada a begin() é considerada "atual".
 */
export function useRequestSequence() {
  const seqRef = useRef(0);

  return useCallback(() => {
    const seq = ++seqRef.current;
    return {
      isCurrent: () => seq === seqRef.current,
    };
  }, []);
}
