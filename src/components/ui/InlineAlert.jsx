import { X } from "lucide-react";

const STYLES = {
  error: "bg-[rgba(239,68,68,0.15)] border-[rgba(239,68,68,0.4)] text-[#fca5a5]",
  success: "bg-[rgba(34,197,94,0.15)] border-[rgba(34,197,94,0.4)] text-[#86efac]",
  warning: "bg-[rgba(251,191,36,0.13)] border-[rgba(251,191,36,0.45)] text-[#fde68a]",
  info: "bg-[rgba(56,189,248,0.12)] border-[rgba(56,189,248,0.4)] text-[#7dd3fc]",
};

export function InlineAlert({ type = "error", children, onDismiss, className = "", action }) {
  return (
    <div
      role={type === "error" ? "alert" : "status"}
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-[0.9rem] font-medium animate-[slide-up_300ms_ease-out] ${STYLES[type] ?? STYLES.error} ${className}`}
    >
      <div className="min-w-0 flex-1">
        {children}
        {action && <div className="mt-2">{action}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md border-none bg-transparent p-0 text-inherit opacity-60 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
          aria-label="Fechar mensagem"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
