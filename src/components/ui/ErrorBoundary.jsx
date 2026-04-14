import { Component } from "react";

/**
 * ErrorBoundary — captura erros de render em qualquer filho e exibe
 * um fallback amigável em vez de deixar a tela em branco.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center">
          <div className="w-16 h-16 rounded-full border border-[rgba(252,88,119,0.3)] bg-[rgba(252,88,119,0.08)] flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fc5877" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div>
            <h2 className="text-[1.3rem] font-bold text-text-main mb-2">Algo deu errado</h2>
            <p className="text-text-soft text-[0.9rem] mb-6 max-w-[400px]">
              Ocorreu um erro inesperado. Tente recarregar a página.
            </p>
          </div>
          <button
            type="button"
            className="px-5 py-[0.6rem] border border-[rgba(199,149,255,0.5)] rounded-xl bg-gradient-to-br from-[#8e39ed] to-[#5f23b3] text-white font-bold text-[0.9rem] cursor-pointer transition-all duration-200 hover:shadow-[0_4px_20px_rgba(142,57,237,0.45)] hover:-translate-y-[1px]"
            onClick={() => window.location.reload()}
          >
            Recarregar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
