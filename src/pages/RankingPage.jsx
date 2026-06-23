import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listarRankingGlobal } from "../services/backendApi";
import { useAuth } from "../hooks/useAuth";
import { PageShell } from "../components/ui/PageShell";
import { InlineAlert } from "../components/ui/InlineAlert";
import { RankBadge, RankInfoTooltip } from "../components/rank";
import { SkeletonCard } from "../components";
import { TOURNAMENT_INPUT_CLASS } from "../styles/uiClasses";

const LIMITE = 20;

export function RankingPage() {
  const { token } = useAuth();
  const [jogadores, setJogadores] = useState([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [buscaInput, setBuscaInput] = useState("");
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRanking = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        limite: LIMITE,
        offset: (pagina - 1) * LIMITE,
      };
      if (busca.trim()) params.nome = busca.trim();

      const data = await listarRankingGlobal(token, params);
      setJogadores(data.jogadores);
      setTotal(data.total);
    } catch (err) {
      setError(err.message || "Erro ao carregar ranking.");
    } finally {
      setLoading(false);
    }
  }, [token, pagina, busca]);

  useEffect(() => {
    loadRanking();
  }, [loadRanking]);

  const totalPaginas = Math.ceil(total / LIMITE) || 1;

  const handleBusca = (e) => {
    e.preventDefault();
    setPagina(1);
    setBusca(buscaInput);
  };

  const handleLimparBusca = () => {
    setBuscaInput("");
    setBusca("");
    setPagina(1);
  };

  const emptyMessage = busca.trim()
    ? `Nenhum jogador encontrado para "${busca.trim()}".`
    : "Nenhum jogador no ranking ainda.";

  return (
    <PageShell>
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="m-0 text-white text-[2rem] font-['Bebas_Neue',sans-serif] tracking-[0.03em]">
            Ranking Global
          </h1>
          <RankInfoTooltip>
            <p className="m-0 mt-1 text-[0.85rem] text-[#beafd7] cursor-help border-b border-dotted border-[rgba(190,175,215,0.35)] inline-block">
              Como funcionam os pontos de rank
            </p>
          </RankInfoTooltip>
        </div>
      </div>

      <form onSubmit={handleBusca} className="flex items-center gap-2 mb-6 flex-wrap">
        <input
          type="search"
          value={buscaInput}
          onChange={(e) => setBuscaInput(e.target.value)}
          placeholder="Buscar por nome..."
          aria-label="Buscar jogador por nome"
          className={`${TOURNAMENT_INPUT_CLASS} flex-1 min-w-[200px] max-w-md`}
        />
        <button
          type="submit"
          className="px-4 py-2 border border-[rgba(199,149,255,0.5)] rounded-lg bg-[rgba(167,79,255,0.15)] text-[#f5edff] text-[0.85rem] font-semibold cursor-pointer hover:bg-[rgba(167,79,255,0.28)] transition-colors"
        >
          Buscar
        </button>
        {busca && (
          <button
            type="button"
            onClick={handleLimparBusca}
            className="px-3 py-2 border border-[rgba(217,180,255,0.2)] rounded-lg text-[#beafd7] text-[0.85rem] hover:text-white hover:border-[rgba(199,149,255,0.4)] transition-colors"
          >
            Limpar
          </button>
        )}
      </form>

      {error && (
        <InlineAlert type="error" className="mb-4" onDismiss={() => setError("")}>
          {error}
        </InlineAlert>
      )}

      {loading ? (
        <div className="grid grid-cols-1 min-[700px]:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : jogadores.length === 0 ? (
        <p className="text-[#beafd7] text-center py-12">{emptyMessage}</p>
      ) : (
        <div className="border border-[rgba(217,180,255,0.2)] rounded-2xl overflow-hidden bg-[linear-gradient(160deg,rgba(34,19,69,0.6),rgba(15,10,29,0.85))]">
          <div className="grid grid-cols-[3rem_1fr_auto_auto] gap-3 px-4 py-3 border-b border-[rgba(217,180,255,0.15)] text-[0.72rem] font-bold uppercase tracking-[0.08em] text-[#c795ff] max-md:grid-cols-[2.5rem_1fr_auto]">
            <span>#</span>
            <span>Jogador</span>
            <span className="max-md:hidden">Rank</span>
            <span className="text-right">Pts</span>
          </div>
          {jogadores.map((jogador, index) => {
            const posicao = jogador.posicao ?? ((pagina - 1) * LIMITE + index + 1);
            const nome = jogador.nome || jogador.usuario?.nome || "Jogador";
            const id = jogador.id || jogador.usuarioId || jogador.usuario?.id;
            const rank = jogador.rank || jogador.usuario?.rank;
            const pontos = jogador.pontosRank ?? jogador.usuario?.pontosRank ?? 0;

            return (
              <div
                key={id || `${nome}-${index}`}
                className="grid grid-cols-[3rem_1fr_auto_auto] gap-3 items-center px-4 py-3 border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(167,79,255,0.06)] transition-colors max-md:grid-cols-[2.5rem_1fr_auto]"
              >
                <span className="text-[#c795ff] font-bold text-center">{posicao}</span>
                <div className="min-w-0">
                  {id ? (
                    <Link
                      to={`/jogadores/${id}`}
                      className="text-[#f5edff] font-semibold no-underline hover:text-[#c795ff] transition-colors truncate block"
                    >
                      {nome}
                    </Link>
                  ) : (
                    <span className="text-[#f5edff] font-semibold truncate block">{nome}</span>
                  )}
                  <div className="md:hidden mt-1">
                    <RankBadge rank={rank} size="sm" />
                  </div>
                </div>
                <div className="max-md:hidden">
                  <RankBadge rank={rank} size="sm" />
                </div>
                <span className="text-[#fde68a] font-bold text-right tabular-nums">{pontos}</span>
              </div>
            );
          })}
        </div>
      )}

      {!loading && totalPaginas > 1 && (
        <nav className="flex items-center justify-center gap-3 mt-8" aria-label="Paginação do ranking">
          <button
            type="button"
            onClick={() => setPagina((p) => Math.max(1, p - 1))}
            disabled={pagina === 1}
            aria-label="Página anterior"
            className="px-3 py-2 border border-[rgba(217,180,255,0.2)] rounded-lg text-[#beafd7] text-[0.85rem] disabled:opacity-40 hover:border-[rgba(199,149,255,0.4)] hover:text-white transition-colors"
          >
            ←
          </button>
          <span className="text-[#beafd7] text-[0.85rem] min-w-[60px] text-center" aria-live="polite">
            {pagina} / {totalPaginas}
          </span>
          <button
            type="button"
            onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
            disabled={pagina === totalPaginas}
            aria-label="Próxima página"
            className="px-3 py-2 border border-[rgba(217,180,255,0.2)] rounded-lg text-[#beafd7] text-[0.85rem] disabled:opacity-40 hover:border-[rgba(199,149,255,0.4)] hover:text-white transition-colors"
          >
            →
          </button>
        </nav>
      )}
    </PageShell>
  );
}
