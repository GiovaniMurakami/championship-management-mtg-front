import { useRef, useCallback } from "react";

/**
 * Prevents double-fire of async actions.
 * Returns a wrapper that skips invocations while one is already in-flight
 * or within a cooldown window (default 600ms).
 */
export function useActionGuard(cooldownMs = 600) {
    const busyRef = useRef(false);

    const guard = useCallback(
        (fn) =>
            async (...args) => {
                if (busyRef.current) return;
                busyRef.current = true;
                try {
                    return await fn(...args);
                } finally {
                    setTimeout(() => {
                        busyRef.current = false;
                    }, cooldownMs);
                }
            },
        [cooldownMs],
    );

    return guard;
}
