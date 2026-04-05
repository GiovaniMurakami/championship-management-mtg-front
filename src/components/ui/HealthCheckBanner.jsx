import { useEffect, useState } from "react";
import httpClient from "../../services/httpClient";

/**
 * Polls GET /health every 30s.
 * Shows a maintenance banner when the backend returns 503 or is unreachable.
 */
export function HealthCheckBanner() {
    const [offline, setOffline] = useState(false);

    useEffect(() => {
        let mounted = true;

        const check = async () => {
            try {
                const res = await httpClient.get("/health", { timeout: 5000 });
                if (mounted) setOffline(res.status === 503);
            } catch {
                if (mounted) setOffline(true);
            }
        };

        check();
        const id = setInterval(check, 30_000);
        return () => {
            mounted = false;
            clearInterval(id);
        };
    }, []);

    if (!offline) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-[rgba(239,68,68,0.92)] text-white text-center text-[0.85rem] font-semibold py-2 px-4 shadow-[0_2px_12px_rgba(0,0,0,0.3)]">
            ⚠️ O servidor está temporariamente indisponível. Algumas funcionalidades podem não funcionar.
        </div>
    );
}
