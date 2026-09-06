/* eslint-disable react-refresh/only-export-components */
import { createPortal } from "react-dom";
import { createContext, useCallback, useContext, useState, useRef } from "react";

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const activeKeys = useRef(new Map());
  const dismissCallbacks = useRef(new Map());
  const removeToast = useCallback((id) => {
    for (const [key, value] of activeKeys.current) {
      if (value === id) activeKeys.current.delete(key);
    }
    const onDismiss = dismissCallbacks.current.get(id);
    dismissCallbacks.current.delete(id);
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    onDismiss?.();
  }, []);

  const addToast = useCallback((message, { type = "error", duration = 6000, action, onDismiss, dedupeKey } = {}) => {
    if (!message) return;
    const key = dedupeKey ?? (typeof message === "string" ? `${type}:${message}` : undefined);
    if (key && activeKeys.current.has(key)) return;
    const id = ++toastId;
    if (key) activeKeys.current.set(key, id);
    if (onDismiss) dismissCallbacks.current.set(id, onDismiss);
    setToasts((prev) => [...prev, { id, message, type, action }]);
    setTimeout(() => removeToast(id), duration);
  }, [removeToast]);

  const colorMap = {
    error:   { border: "rgba(252,88,119,0.4)", bg: "rgba(30,15,45,0.95)", text: "#ffa8b8" },
    success: { border: "rgba(34,197,94,0.4)",  bg: "rgba(10,30,20,0.95)", text: "#86efac" },
    info:    { border: "rgba(167,79,255,0.4)", bg: "rgba(20,10,40,0.95)", text: "#d8b4fe" },
    warning: { border: "rgba(251,191,36,0.45)", bg: "rgba(42,30,8,0.95)", text: "#fde68a" },
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {createPortal(<div aria-live="polite" aria-relevant="additions" className="fixed top-20 mt-4 left-1/2 -translate-x-1/2 z-[10000] flex flex-col gap-2 items-center pointer-events-none">
        {toasts.map((toast) => {
          const c = colorMap[toast.type] ?? colorMap.error;
          return (
            <div
              key={toast.id}
              role={toast.type === "error" ? "alert" : "status"}
              className="pointer-events-auto px-5 py-3 rounded-xl border backdrop-blur-md text-[0.9rem] font-semibold shadow-[0_8px_24px_rgba(0,0,0,0.4)] max-w-[90vw] text-center flex items-center gap-3 animate-[slide-up_300ms_ease-out]"
              style={{ borderColor: c.border, background: c.bg, color: c.text }}
            >
              <div className="min-w-0">{toast.message}{toast.action && <div className="mt-2">{toast.action}</div>}</div>
              <button
                type="button"
                className="ml-1 bg-transparent border-none cursor-pointer text-lg leading-none opacity-70 hover:opacity-100"
                style={{ color: c.text }}
                onClick={() => removeToast(toast.id)}
                aria-label="Fechar notificação"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>, document.body)}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast deve ser usado dentro de ToastProvider");
  return ctx;
}
