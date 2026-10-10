export function BreakdownPanel({
  title,
  description,
  children,
  className = "",
  bodyClassName = "",
}) {
  return (
    <section className={`rounded-2xl border border-line bg-surface p-4 sm:p-5 shadow-card ${className}`.trim()}>
      <div className="mb-4 shrink-0">
        <h2 className="m-0 text-lg font-bold text-text-main">{title}</h2>
        {description ? (
          <p className="m-0 mt-1 text-sm text-text-muted">{description}</p>
        ) : null}
      </div>
      {bodyClassName ? <div className={bodyClassName}>{children}</div> : children}
    </section>
  );
}
