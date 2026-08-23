import { RankingBadge } from "./RankingBadge";

export function RankProgressAnimation({ progresso, onClose }) {
  if (!progresso) return null;
  const subiu = progresso.novoRating > progresso.ratingAnterior;
  const mudouDivisao = progresso.divisaoAnterior !== progresso.novaDivisao;
  const delta = progresso.novoRating - progresso.ratingAnterior;

  return <div className="fixed inset-0 z-[105] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" role="status" aria-live="polite" onClick={onClose}>
    <div className={`w-full max-w-sm animate-[slide-up_350ms_ease-out] overflow-hidden rounded-2xl border bg-[#120b24] p-6 text-center shadow-overlay ${subiu ? "border-emerald-400/50" : "border-danger/50"}`} onClick={(event) => event.stopPropagation()}>
      <div className={`mx-auto flex h-16 w-16 animate-bounce items-center justify-center rounded-full border text-3xl ${subiu ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-300" : "border-danger/50 bg-danger/10 text-red-300"}`}>{subiu ? "↑" : "↓"}</div>
      <p className={`mb-0 mt-4 text-xs font-bold uppercase tracking-[0.18em] ${subiu ? "text-emerald-300" : "text-red-300"}`}>{mudouDivisao ? (subiu ? "Promoção de ranking" : "Rebaixamento de ranking") : "Rating atualizado"}</p>
      <h2 className="mb-0 mt-2 text-3xl text-white">{delta > 0 ? "+" : ""}{delta} pontos</h2>
      <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-xl border border-line bg-white/[0.03] p-4">
        <div><span className="block text-xs text-text-muted">Anterior</span><strong className="mt-1 block text-xl text-text-soft">{progresso.ratingAnterior}</strong></div>
        <span className={subiu ? "text-emerald-300" : "text-red-300"}>→</span>
        <div><span className="block text-xs text-text-muted">Atual</span><strong className="mt-1 block text-xl text-white">{progresso.novoRating}</strong></div>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2"><RankingBadge divisao={progresso.divisaoAnterior} /><span className="text-text-muted">→</span><RankingBadge divisao={progresso.novaDivisao} /></div>
      <button type="button" className="mt-6 text-sm font-semibold text-text-muted transition hover:text-white" onClick={onClose}>Fechar</button>
    </div>
  </div>;
}
