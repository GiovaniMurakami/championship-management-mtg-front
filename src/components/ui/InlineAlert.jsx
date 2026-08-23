const STYLES = {
  error: "bg-[rgba(239,68,68,0.15)] border-[rgba(239,68,68,0.4)] text-[#fca5a5]",
  success: "bg-[rgba(34,197,94,0.15)] border-[rgba(34,197,94,0.4)] text-[#86efac]",
  warning: "bg-[rgba(251,191,36,0.13)] border-[rgba(251,191,36,0.45)] text-[#fde68a]",
  info: "bg-[rgba(56,189,248,0.12)] border-[rgba(56,189,248,0.4)] text-[#7dd3fc]",
};

export function InlineAlert({
  type = "error",
  children,
  onDismiss,
  className = "",
  action,
}) {
  return (
    <div
      role={type === "error" ? "alert" : "status"}
      className={`flex items-start gap-3 px-4 py-3 rounded-lg border text-[0.9rem] font-medium animate-[slide-up_300ms_ease-out] ${STYLES[type] ?? STYLES.error} ${className}`}
    >
      <div className="flex-1 min-w-0">
        {children}
        {action && <div className="mt-2">{action}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-inherit opacity-60 hover:opacity-100 cursor-pointer bg-transparent border-none p-0 text-[1rem] leading-none flex-shrink-0"
          aria-label="Fechar mensagem"
        >
          ✕
        </button>
      )}
    </div>
  );
}
