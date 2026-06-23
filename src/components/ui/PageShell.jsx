/**
 * PageShell — container padrão de página autenticada.
 * Aplica max-width, padding horizontal e top padding para a navbar fixa.
 */
export function PageShell({ children, className = "" }) {
  return (
    <div className={`max-w-[1200px] mx-auto px-6 pt-[7.5rem] pb-12 max-sm:px-4 max-sm:pt-[6.5rem] w-full min-w-0 overflow-x-clip animate-[fade-in_400ms_ease-out] ${className}`}>
      {children}
    </div>
  );
}
