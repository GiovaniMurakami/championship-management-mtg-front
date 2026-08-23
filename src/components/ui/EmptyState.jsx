export function EmptyState({ title, description, action, icon, className = "" }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-12 px-4 rounded-xl border border-line-soft bg-white/[0.025] ${className}`}>
      {icon && (
        <div className="text-[2.5rem] opacity-40 mb-2" aria-hidden="true">{icon}</div>
      )}
      <h2 className="m-0 text-text-main text-[1.05rem] font-semibold">{title}</h2>
      {description && (
        <p className="m-0 mt-2 text-text-soft text-[0.9rem] max-w-[420px] leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
