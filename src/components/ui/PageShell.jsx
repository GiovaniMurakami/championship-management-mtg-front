/**
 * PageShell — container padrão de página autenticada.
 * Aplica max-width, padding horizontal e top padding para a navbar fixa.
 */
export function PageShell({ children, className = "" }) {
  return (
    <div className={`w-full min-w-0 overflow-x-clip animate-[fade-in_400ms_ease-out] ${className}`}>
      {children}
    </div>
  );
}
