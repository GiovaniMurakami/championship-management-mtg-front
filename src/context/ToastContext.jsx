/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useState } from "react";

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, { type = "error", duration = 6000 } = {}) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const colorMap = {
    error:   { border: "rgba(252,88,119,0.4)", bg: "rgba(30,15,45,0.95)", text: "#ffa8b8" },
    success: { border: "rgba(34,197,94,0.4)",  bg: "rgba(10,30,20,0.95)", text: "#86efac" },
    info:    { border: "rgba(167,79,255,0.4)", bg: "rgba(20,10,40,0.95)", text: "#d8b4fe" },
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[110] flex flex-col gap-2 items-center pointer-events-none">
        {toasts.map((toast) => {
          const c = colorMap[toast.type] ?? colorMap.error;
          return (
            <div
              key={toast.id}
              className="pointer-events-auto px-5 py-3 rounded-xl border backdrop-blur-md text-[0.9rem] font-semibold shadow-[0_8px_24px_rgba(0,0,0,0.4)] max-w-[90vw] text-center flex items-center gap-3 animate-[slide-up_300ms_ease-out]"
              style={{ borderColor: c.border, background: c.bg, color: c.text }}
            >
              <span>{toast.message}</span>
              <button
                type="button"
                className="ml-1 bg-transparent border-none cursor-pointer text-lg leading-none opacity-70 hover:opacity-100"
                style={{ color: c.text }}
                onClick={() => removeToast(toast.id)}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast deve ser usado dentro de ToastProvider");
  return ctx;
}
