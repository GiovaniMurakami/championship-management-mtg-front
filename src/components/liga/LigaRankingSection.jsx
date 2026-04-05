import { useState, useCallback } from "react";
import { buscarCartaPorNome } from "../../services/scryfallApi";

const _imgCache = new Map();

function getInitials(nome) {
  if (!nome || nome === "—") return "?";
  return nome
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const AVATAR_PALETTES = [
  "from-[#8e39ed] to-[#5f23b3]",
  "from-[#0d9488] to-[#0891b2]",
  "from-[#d97706] to-[#b45309]",
  "from-[#7c3aed] to-[#4f46e5]",
  "from-[#be185d] to-[#9d174d]",
  "from-[#0369a1] to-[#1e40af]",
];

function avatarGradient(idx) {
  return AVATAR_PALETTES[idx % AVATAR_PALETTES.length];
}

function MedalBadge({ pos }) {
  if (pos === 1)
    return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[rgba(251,191,36,0.18)] border border-[rgba(251,191,36,0.55)] flex-shrink-0">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24" aria-hidden="true">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
      </span>
    );
  if (pos === 2)
    return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[rgba(148,163,184,0.15)] border border-[rgba(148,163,184,0.4)] flex-shrink-0">
        <span className="text-[0.78rem] font-bold text-[#94a3b8]">2</span>
      </span>
    );
  if (pos === 3)
    return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[rgba(205,127,50,0.15)] border border-[rgba(205,127,50,0.4)] flex-shrink-0">
        <span className="text-[0.78rem] font-bold text-[#cd9a5c]">3</span>
      </span>
    );
  return (
    <span className="inline-flex items-center justify-center w-8 text-[0.8rem] text-[rgba(190,175,215,0.5)] font-semibold flex-shrink-0">
      {pos}
    </span>
  );
}

function CardPreviewTooltip({ imageUrl, x, y, visible, isLoading }) {
  if (!visible) return null;
  return (
    <div className="fixed z-[9999] pointer-events-none" style={{ left: x, top: y }}>
      {isLoading || !imageUrl ? (
        <div className="w-[180px] h-[252px] rounded-[10px] bg-[rgba(26,16,50,0.95)] border border-[rgba(199,149,255,0.3)] animate-pulse" />
      ) : (
        <img
          src={imageUrl}
          alt="Card preview"
          width={180}
          className="w-[180px] rounded-[10px] shadow-[0_16px_48px_rgba(0,0,0,0.9),0_0_0_1px_rgba(199,149,255,0.25)] animate-[fade-in_150ms_ease-out] block"
          loading="eager"
        />
      )}
    </div>
  );
}

function SectionHeader({ icon, title, subtitle, count }) {
  return (
    <div className="px-5 py-4 border-b border-[rgba(217,180,255,0.15)] bg-white/[0.02] flex items-center justify-between gap-3">
      <div className="flex items-center gap-[0.65rem]">
        <span className="text-[1.2rem] leading-none" aria-hidden="true">{icon}</span>
        <div>
          <h3 className="m-0 text-[#f5edff] font-semibold text-[1rem] leading-snug">{title}</h3>
          {subtitle && <p className="m-0 mt-[0.15rem] text-[#beafd7] text-[0.78rem]">{subtitle}</p>}
        </div>
      </div>
      {count != null && (
        <span className="text-[0.75rem] font-semibold text-[#beafd7] bg-[rgba(217,180,255,0.1)] border border-[rgba(217,180,255,0.2)] rounded-full px-[0.75rem] py-[0.2rem] flex-shrink-0">
          {count}
        </span>
      )}
    </div>
  );
}

export function LigaRankingSection({ ranking, loading }) {
  const [cardPreview, setCardPreview] = useState({
    visible: false,
    imageUrl: null,
    x: 0,
    y: 0,
    isLoading: false,
  });

  const handleCardHover = useCallback(async (cardName, e) => {
    if (!cardName || cardName === "—") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const spaceRight = window.innerWidth - rect.right;
    const x = spaceRight > 210 ? rect.right + 12 : rect.left - 198;
    const y = Math.max(8, Math.min(rect.top - 20, window.innerHeight - 280));

    if (_imgCache.has(cardName)) {
      setCardPreview({ visible: true, imageUrl: _imgCache.get(cardName), x, y, isLoading: false });
      return;
    }
    setCardPreview({ visible: true, imageUrl: null, x, y, isLoading: true });
    try {
      const card = await buscarCartaPorNome(cardName);
      const url = card?.imagem || null;
      _imgCache.set(cardName, url);
      setCardPreview((prev) =>
        prev.visible ? { ...prev, imageUrl: url, isLoading: false } : prev
      );
    } catch {
      setCardPreview({ visible: false, imageUrl: null, x: 0, y: 0, isLoading: false });
    }
  }, []);

  const handleCardLeave = useCallback(() => {
    setCardPreview({ visible: false, imageUrl: null, x: 0, y: 0, isLoading: false });
  }, []);

  if (loading) {
    return (
      <div className="grid gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-[1rem] border border-[rgba(217,180,255,0.1)] bg-white/[0.03] h-[200px] animate-pulse" />
        ))}
      </div>
    );
  }

  if (!ranking) return null;

  const jogadores = ranking.rankingJogadores || ranking.jogadores || ranking.players || [];
  const decks = ranking.rankingDecks || ranking.decks || [];
  const cartas = ranking.rankingCartas || ranking.cartas || ranking.cards || [];

  const sectionClass =
    "bg-[linear-gradient(155deg,rgba(26,16,50,0.98)_0%,rgba(16,10,32,0.98)_100%)] rounded-[1rem] border border-[rgba(217,180,255,0.15)] overflow-hidden";

  return (
    <>
      <CardPreviewTooltip {...cardPreview} />

      <div className="grid gap-6">
        {/* ── Jogadores ── */}
        {jogadores.length > 0 && (
          <div className={sectionClass}>
            <SectionHeader
              icon="🏆"
              title="Ranking de Jogadores"
              subtitle="Classificação geral da liga"
              count={`${jogadores.length} jogadores`}
            />
            <ul className="divide-y divide-[rgba(217,180,255,0.07)] m-0 p-0 list-none">
              {jogadores.map((j, idx) => {
                const pos = j.posicao ?? idx + 1;
                const nome = j.jogador?.nome || j.nome || j.usuario?.nome || "—";
                const pts = j.pontos ?? "—";
                const wins = j.vitorias ?? j.wins ?? 0;
                const losses = j.derrotas ?? j.losses ?? 0;
                const draws = j.empates ?? j.draws ?? 0;
                const total = wins + losses + draws;
                const winRate = total > 0 ? Math.round((wins / total) * 100) : null;
                const isTop3 = pos <= 3;

                return (
                  <li
                    key={j.jogador?.id ?? j.id ?? j.usuarioId ?? idx}
                    className={`flex items-center gap-3 px-5 py-[0.85rem] transition-colors duration-150 hover:bg-white/[0.025] ${isTop3 ? "bg-white/[0.015]" : ""}`}
                  >
                    <MedalBadge pos={pos} />

                    <span
                      className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarGradient(idx)} flex items-center justify-center text-[0.72rem] font-bold text-white flex-shrink-0 select-none`}
                    >
                      {getInitials(nome)}
                    </span>

                    <span
                      className={`flex-1 min-w-0 font-semibold overflow-hidden text-ellipsis whitespace-nowrap text-[0.92rem] ${isTop3 ? "text-[#f5edff]" : "text-[#c4b5fd]"}`}
                    >
                      {nome}
                    </span>

                    <div className="hidden min-[560px]:flex items-center gap-[0.3rem] flex-shrink-0">
                      <span className="text-[0.72rem] font-semibold text-[#22c55e] bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.25)] rounded-full px-[0.55rem] py-[0.1rem]">
                        {wins}V
                      </span>
                      {draws > 0 && (
                        <span className="text-[0.72rem] font-semibold text-[#fbbf24] bg-[rgba(251,191,36,0.1)] border border-[rgba(251,191,36,0.25)] rounded-full px-[0.55rem] py-[0.1rem]">
                          {draws}E
                        </span>
                      )}
                      <span className="text-[0.72rem] font-semibold text-[#ef4444] bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.25)] rounded-full px-[0.55rem] py-[0.1rem]">
                        {losses}D
                      </span>
                    </div>

                    {winRate !== null && (
                      <span className="hidden min-[640px]:block text-[0.75rem] text-[rgba(190,175,215,0.6)] flex-shrink-0 w-[3.5rem] text-right">
                        {winRate}% win
                      </span>
                    )}

                    <span
                      className={`font-['Bebas_Neue',sans-serif] text-[1.3rem] tracking-[0.04em] flex-shrink-0 w-[3rem] text-right ${isTop3 ? "text-[#f0b429]" : "text-[rgba(240,180,41,0.7)]"}`}
                    >
                      {pts}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* ── Decks ── */}
        {decks.length > 0 && (
          <div className={sectionClass}>
            <SectionHeader
              icon="🃏"
              title="Ranking de Arquétipos"
              subtitle="Decks mais utilizados na liga"
              count={`${decks.length} arquétipos`}
            />
            <ul className="divide-y divide-[rgba(217,180,255,0.07)] m-0 p-0 list-none">
              {decks.map((d, idx) => {
                const pos = d.posicao ?? idx + 1;
                const nome = d.nome || d.archetype || d.nomeArquetipo || "—";
                const usos = d.totalUsos ?? d.usos ?? d.uses ?? "—";
                const wins = d.vitorias ?? d.wins ?? "—";

                return (
                  <li
                    key={d.id ?? d.nome ?? idx}
                    className="flex items-center gap-3 px-5 py-[0.8rem] hover:bg-white/[0.02] transition-colors duration-150"
                  >
                    <MedalBadge pos={pos} />

                    <span className="flex-1 min-w-0 font-semibold overflow-hidden text-ellipsis whitespace-nowrap text-[0.92rem] text-[#f5edff]">
                      {nome}
                    </span>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right hidden min-[520px]:block">
                        <p className="m-0 text-[0.67rem] uppercase tracking-[0.07em] text-[rgba(190,175,215,0.5)] leading-none mb-[0.2rem]">
                          Usos
                        </p>
                        <p className="m-0 text-[0.9rem] font-semibold text-[#7dd3fc]">{usos}</p>
                      </div>
                      <div className="text-right">
                        <p className="m-0 text-[0.67rem] uppercase tracking-[0.07em] text-[rgba(190,175,215,0.5)] leading-none mb-[0.2rem]">
                          Vitórias
                        </p>
                        <p className="m-0 text-[0.9rem] font-semibold text-[#22c55e]">{wins}</p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* ── Cartas ── */}
        {cartas.length > 0 && (
          <div className={sectionClass}>
            <SectionHeader
              icon="✨"
              title="Ranking de Cartas"
              subtitle="Passe o mouse sobre o nome para ver a carta"
              count={`${cartas.length} cartas`}
            />
            <ul className="divide-y divide-[rgba(217,180,255,0.07)] m-0 p-0 list-none">
              {cartas.map((c, idx) => {
                const pos = c.posicao ?? idx + 1;
                const nome = c.nome || c.name || "—";
                const copias = c.totalCopias ?? c.totalCopies ?? "—";
                const totalDecks = c.totalDecks ?? c.quantidadeDecks ?? c.deckCount ?? "—";

                return (
                  <li
                    key={c.id ?? c.nome ?? idx}
                    className="flex items-center gap-3 px-5 py-[0.75rem] hover:bg-white/[0.025] transition-colors duration-150"
                  >
                    <MedalBadge pos={pos} />

                    <button
                      type="button"
                      className="flex-1 min-w-0 text-left group bg-transparent border-none p-0 cursor-default"
                      onMouseEnter={(e) => handleCardHover(nome, e)}
                      onMouseLeave={handleCardLeave}
                      onFocus={(e) => handleCardHover(nome, e)}
                      onBlur={handleCardLeave}
                    >
                      <span className="font-semibold text-[0.92rem] text-[#f5edff] group-hover:text-[#c4b5fd] transition-colors duration-150 underline decoration-dotted decoration-[rgba(199,149,255,0.4)] underline-offset-[3px] overflow-hidden text-ellipsis whitespace-nowrap max-w-full block">
                        {nome}
                      </span>
                    </button>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right hidden min-[520px]:block">
                        <p className="m-0 text-[0.67rem] uppercase tracking-[0.07em] text-[rgba(190,175,215,0.5)] leading-none mb-[0.2rem]">
                          Cópias
                        </p>
                        <p className="m-0 text-[0.9rem] font-semibold text-[#c795ff]">{copias}</p>
                      </div>
                      <div className="text-right">
                        <p className="m-0 text-[0.67rem] uppercase tracking-[0.07em] text-[rgba(190,175,215,0.5)] leading-none mb-[0.2rem]">
                          Decks
                        </p>
                        <p className="m-0 text-[0.9rem] font-semibold text-[#7dd3fc]">{totalDecks}</p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {jogadores.length === 0 && decks.length === 0 && cartas.length === 0 && (
          <div className="text-center py-16 text-[#888]">
            <svg
              className="mx-auto mb-3 opacity-30"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path d="M3 3l18 18" />
              <path d="M21 3H8M3 8h3m0 0v13m0 0h13M8 8v13" />
            </svg>
            <p className="m-0 text-base">Nenhum dado de ranking disponível ainda.</p>
          </div>
        )}
      </div>
    </>
  );
}
