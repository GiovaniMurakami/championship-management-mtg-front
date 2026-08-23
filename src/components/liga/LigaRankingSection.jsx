import { useState, useCallback, useEffect } from "react";
import { buscarCartaPorNome, buscarCartasPorNome } from "../../services/scryfallApi";
import { EmptyState } from "../ui/EmptyState";
import { UsuarioNomeExibicao } from "../ui/UsuarioExcluidoTag";

// ── Utilities ──────────────────────────────────────────────────────────────────

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

function calcWinRate(vitorias, derrotas, empates) {
  const total = vitorias + derrotas + empates;
  return total > 0 ? Math.round((vitorias / total) * 100) : null;
}

function formatRecordeVd(vitorias = 0, derrotas = 0, empates = 0) {
  if (empates > 0) return `${vitorias}/${derrotas}/${empates}`;
  return `${vitorias}/${derrotas}`;
}

function winRateStyle(rate) {
  if (rate === null) return { color: "rgba(190,175,215,0.4)", track: "rgba(217,180,255,0.08)" };
  if (rate >= 60) return { color: "#22c55e", track: "rgba(34,197,94,0.18)" };
  if (rate >= 40) return { color: "#fbbf24", track: "rgba(251,191,36,0.18)" };
  return { color: "#ef4444", track: "rgba(239,68,68,0.18)" };
}

// ── Shared sub-components ──────────────────────────────────────────────────────

function CardPreviewTooltip({ imageUrl, x, y, visible, isLoading }) {
  if (!visible) return null;
  return (
    <div className="fixed z-[9999] pointer-events-none" style={{ left: x, top: y }}>
      {isLoading || !imageUrl ? (
        <div className="w-[180px] h-[252px] rounded-lg bg-[rgba(26,16,50,0.95)] border border-[rgba(199,149,255,0.3)] animate-pulse" />
      ) : (
        <img
          src={imageUrl}
          alt="Card preview"
          width={180}
          className="w-[180px] rounded-lg shadow-[0_16px_48px_rgba(0,0,0,0.9),0_0_0_1px_rgba(199,149,255,0.25)] block"
          loading="eager"
        />
      )}
    </div>
  );
}

function WinRateBar({ rate, className = "" }) {
  if (rate === null) return null;
  const style = winRateStyle(rate);
  return (
    <div className={`h-[3px] rounded-full w-full ${className}`} style={{ background: style.track }}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(rate, 100)}%`, background: style.color }}
      />
    </div>
  );
}

function CardThumbnail({ cardName, imageUrl, onHover, onLeave, size = "sm", className = "" }) {
  const sizes = {
    sm: "w-[38px] h-[53px] rounded-[5px]",
    md: "w-[52px] h-[72px] rounded-md",
    lg: "w-full aspect-[5/7] rounded-md",
  };

  if (!cardName) return null;

  return (
    <button
      type="button"
      className={`flex-shrink-0 overflow-hidden border border-[rgba(199,149,255,0.25)] bg-[rgba(26,16,50,0.8)] shadow-[0_4px_12px_rgba(0,0,0,0.35)] cursor-default p-0 transition-transform duration-200 hover:scale-[1.04] hover:border-[rgba(199,149,255,0.45)] ${sizes[size]} ${className}`}
      onMouseEnter={(e) => onHover?.(cardName, e)}
      onMouseLeave={onLeave}
      onFocus={(e) => onHover?.(cardName, e)}
      onBlur={onLeave}
      aria-label={cardName}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          className="w-full h-full object-cover object-top block"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full animate-pulse bg-[rgba(199,149,255,0.12)]" />
      )}
    </button>
  );
}

function PopularityBar({ value, max, color = "#c795ff" }) {
  if (!max || max <= 0) return null;
  const pct = Math.round((value / max) * 100);
  return (
    <div className="h-[3px] rounded-full w-full bg-[rgba(217,180,255,0.08)]">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

function RankingOverview({ ranking, jogadores, decks, cartas }) {
  const lider = jogadores[0];
  const topDeck = decks[0];
  const topCarta = cartas[0];

  const chips = [
    lider && {
      label: "Líder",
      value: lider.jogador?.nome || "—",
      detail: `${lider.pontos ?? 0} pts · ${formatRecordeVd(lider.vitorias ?? 0, lider.derrotas ?? 0, lider.empates ?? 0)}`,
      accent: "#fbbf24",
    },
    topDeck && {
      label: "Arquétipo #1",
      value: topDeck.nome || "—",
      detail: `${topDeck.totalUsos ?? 0} usos · ${topDeck.winrate ?? Math.round(((topDeck.vitorias ?? 0) / Math.max(topDeck.totalUsos ?? 1, 1)) * 100)}% win`,
      accent: "#7dd3fc",
    },
    topCarta && {
      label: "Carta #1",
      value: topCarta.nome || topCarta.name || "—",
      detail: `${topCarta.totalCopias ?? 0} cópias · ${topCarta.totalDecks ?? 0} decks`,
      accent: "#c795ff",
    },
  ].filter(Boolean);

  if (chips.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {chips.map((chip) => (
        <div
          key={chip.label}
          className="rounded-lg border border-line-soft bg-white/[0.025] px-4 py-3"
        >
          <p
            className="m-0 text-[0.65rem] uppercase tracking-[0.08em] font-semibold mb-1"
            style={{ color: chip.accent }}
          >
            {chip.label}
          </p>
          <p className="m-0 text-[0.92rem] font-semibold text-text-main truncate">{chip.value}</p>
          <p className="m-0 mt-[0.25rem] text-[0.72rem] text-[rgba(190,175,215,0.45)]">{chip.detail}</p>
        </div>
      ))}
      {ranking.ligaNome && (
        <p className="sr-only">Ranking da liga {ranking.ligaNome}</p>
      )}
    </div>
  );
}

function SpotlightCard({ pos, title, subtitle, imageUrl, cardName, stats, onHover, onLeave, accent, artwork = false }) {
  return (
    <div
      className="relative rounded-xl border overflow-hidden flex flex-col"
      style={{
        borderColor: `${accent}55`,
        background: `linear-gradient(155deg, ${accent}12 0%, rgba(16,10,32,0.95) 100%)`,
      }}
    >
      {artwork && cardName && (
        <div className="absolute inset-x-0 top-0 z-0 h-32 overflow-hidden bg-white/[0.04]" aria-hidden="true">
          {imageUrl ? <img src={imageUrl} alt="" className="h-full w-full object-cover object-center" /> : <span className="block h-full w-full animate-pulse bg-white/[0.06]" />}
          <span className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-[rgba(16,10,32,0.95)]" />
        </div>
      )}
      <div className="absolute top-3 left-3 z-10">
        <MedalBadge pos={pos} />
      </div>
      <div className={`relative z-[1] p-4 flex flex-col items-center gap-3 flex-1 ${artwork && cardName ? "pt-36" : "pt-12"}`}>
        {cardName && !artwork && (
          <div className="w-[88px]">
            <CardThumbnail
              cardName={cardName}
              imageUrl={imageUrl}
              onHover={onHover}
              onLeave={onLeave}
              size="lg"
            />
          </div>
        )}
        <div className={`text-center w-full min-w-0 ${artwork && cardName ? "rounded-lg border border-white/[0.06] bg-[rgba(16,10,32,0.82)] px-3 py-2 shadow-[0_-8px_24px_rgba(16,10,32,0.45)]" : ""}`}>
          <p className="m-0 font-semibold text-white text-[0.95rem] truncate">{title}</p>
          {subtitle && (
            <p className="m-0 mt-[0.2rem] text-[0.72rem] text-[rgba(190,175,215,0.45)] truncate">{subtitle}</p>
          )}
        </div>
        {stats && <div className="w-full">{stats}</div>}
      </div>
    </div>
  );
}

function VoceBadge() {
  return (
    <span className="inline-block text-[0.62rem] font-bold text-[#818cf8] bg-[rgba(79,70,229,0.2)] border border-[rgba(79,70,229,0.45)] rounded-full px-[0.4rem] py-[0.05rem] tracking-[0.07em] flex-shrink-0 leading-[1.6]">
      VOCÊ
    </span>
  );
}

function MedalBadge({ pos }) {
  if (pos === 1)
    return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[rgba(251,191,36,0.18)] border border-[rgba(251,191,36,0.55)] flex-shrink-0">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="#fbbf24" aria-hidden="true">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
      </span>
    );
  if (pos === 2)
    return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[rgba(148,163,184,0.15)] border border-[rgba(148,163,184,0.4)] flex-shrink-0">
        <span className="text-[0.75rem] font-bold text-[#94a3b8]">2</span>
      </span>
    );
  if (pos === 3)
    return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[rgba(205,127,50,0.15)] border border-[rgba(205,127,50,0.4)] flex-shrink-0">
        <span className="text-[0.75rem] font-bold text-[#cd9a5c]">3</span>
      </span>
    );
  return (
    <span className="inline-flex items-center justify-center w-8 text-[0.8rem] text-[rgba(190,175,215,0.4)] font-semibold flex-shrink-0">
      {pos}
    </span>
  );
}

function CartaRow({ carta, idx, maxCopias, cardImageUrl, onCardHover, onCardLeave }) {
  const pos = carta.posicao ?? idx + 1;
  const nome = carta.nome || carta.name || "—";
  const copias = carta.totalCopias ?? 0;
  const totalDecks = carta.totalDecks ?? "—";
  const isTop3 = pos <= 3;

  return (
    <li
      key={carta.id ?? carta.nome ?? idx}
      className={`flex items-center gap-3 px-5 py-[0.75rem] hover:bg-white/[0.025] transition-colors duration-150 ${isTop3 ? "bg-white/[0.015]" : ""}`}
    >
      <MedalBadge pos={pos} />

      <CardThumbnail
        cardName={nome}
        imageUrl={cardImageUrl}
        onHover={onCardHover}
        onLeave={onCardLeave}
      />

      <div className="flex-1 min-w-0">
        <button
          type="button"
          className="w-full text-left group bg-transparent border-none p-0 cursor-default"
          onMouseEnter={(e) => onCardHover(nome, e)}
          onMouseLeave={onCardLeave}
          onFocus={(e) => onCardHover(nome, e)}
          onBlur={onCardLeave}
        >
          <span className="font-semibold text-[0.92rem] text-text-main group-hover:text-[#c4b5fd] transition-colors duration-150 overflow-hidden text-ellipsis whitespace-nowrap max-w-full block">
            {nome}
          </span>
        </button>
        <div className="mt-[0.35rem] max-w-[220px] hidden min-[480px]:block">
          <PopularityBar value={copias} max={maxCopias} />
        </div>
      </div>

      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="text-right hidden min-[520px]:block">
          <p className="m-0 text-[0.62rem] uppercase tracking-[0.07em] text-[rgba(190,175,215,0.45)] leading-none mb-[0.2rem]">
            Cópias
          </p>
          <p className="m-0 text-[0.88rem] font-semibold text-brand">{copias}</p>
        </div>
        <div className="text-right">
          <p className="m-0 text-[0.62rem] uppercase tracking-[0.07em] text-[rgba(190,175,215,0.45)] leading-none mb-[0.2rem]">
            Decks
          </p>
          <p className="m-0 text-[0.88rem] font-semibold text-[#7dd3fc]">{totalDecks}</p>
        </div>
      </div>
    </li>
  );
}

function RecordeVd({ vitorias, derrotas, empates, className = "" }) {
  return (
    <span className={`text-[0.8rem] font-semibold tabular-nums text-[#c4b5fd] ${className}`}>
      {formatRecordeVd(vitorias, derrotas, empates)}
    </span>
  );
}

// ── Player list row ────────────────────────────────────────────────────────────

function PlayerRow({ jogador, idx, isLogado }) {
  const pos = jogador.posicao;
  const nome = jogador.jogador?.nome || "—";
  const excluido = Boolean(jogador.jogador?.excluido);
  const pts = jogador.pontos ?? 0;
  const wins = jogador.vitorias ?? 0;
  const losses = jogador.derrotas ?? 0;
  const draws = jogador.empates ?? 0;
  const winRate = calcWinRate(wins, losses, draws);

  return (
    <li
      className={`flex items-center gap-3 px-5 py-[0.85rem] transition-colors duration-150 hover:bg-white/[0.025] ${isLogado
          ? "bg-[rgba(79,70,229,0.07)] border-l-[3px] border-l-[rgba(99,102,241,0.55)]"
          : ""
        }`}
    >
      <MedalBadge pos={pos} />

      <span
        className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarGradient(idx)} flex items-center justify-center text-[0.72rem] font-bold text-white flex-shrink-0 select-none`}
      >
        {getInitials(excluido ? "UE" : nome)}
      </span>

      <div className="flex-1 min-w-0 flex items-center gap-[0.45rem] overflow-hidden">
        <span className="font-semibold overflow-hidden text-ellipsis whitespace-nowrap text-[0.92rem] text-[#c4b5fd]">
          <UsuarioNomeExibicao nome={nome} excluido={excluido} />
        </span>
        {isLogado && <VoceBadge />}
      </div>

      <div className="hidden min-[520px]:flex items-center flex-shrink-0 min-w-[3.5rem] justify-end">
        <RecordeVd vitorias={wins} derrotas={losses} empates={draws} />
      </div>

      {winRate !== null && (
        <div className="hidden min-[480px]:flex flex-col flex-shrink-0 w-[4.5rem] gap-[0.25rem]">
          <span className="text-[0.75rem] font-semibold text-right text-text-soft">
            {winRate}%
          </span>
          <WinRateBar rate={winRate} />
        </div>
      )}

      <span className="font-['Bebas_Neue',sans-serif] text-[1.3rem] tracking-[0.04em] flex-shrink-0 w-[3rem] text-right text-[rgba(240,180,41,0.7)]">
        {pts}
      </span>
    </li>
  );
}

// ── Deck list row ──────────────────────────────────────────────────────────────

function DeckRow({ deck, cardImageUrl, cardDisplayName, maxUsos, onCardHover, onCardLeave }) {
  const pos = deck.posicao;
  const nome = deck.nome || "—";
  const cartaPrincipal = deck.cartaRepresentativa || deck.cartaPrincipal;
  const usos = deck.totalUsos ?? 0;
  const wins = deck.vitorias ?? 0;
  const losses = deck.derrotas ?? 0;
  const winRate = deck.winrate ?? (usos > 0 ? Math.round((wins / usos) * 1000) / 10 : null);
  const wr = winRateStyle(typeof winRate === "number" ? Math.round(winRate) : null);
  const isTop3 = pos <= 3;

  return (
    <li className={`flex items-center gap-3 px-5 py-[0.9rem] hover:bg-white/[0.02] transition-colors duration-150 ${isTop3 ? "bg-white/[0.015]" : ""}`}>
      <MedalBadge pos={pos} />

      {cartaPrincipal ? (
        <CardThumbnail
          cardName={cartaPrincipal}
          imageUrl={cardImageUrl}
          onHover={onCardHover}
          onLeave={onCardLeave}
        />
      ) : (
        <span className="flex-shrink-0 w-[38px] h-[53px] rounded-[5px] border border-line-soft bg-[rgba(26,16,50,0.5)] flex items-center justify-center text-[1.1rem] opacity-40">
          🃏
        </span>
      )}

      <div className="flex-1 min-w-0">
        <span className="font-semibold overflow-hidden text-ellipsis whitespace-nowrap text-[0.92rem] text-text-main block">
          {nome}
        </span>
        {cartaPrincipal && (
          <p className="m-0 mt-[0.15rem] text-[0.72rem] text-[rgba(190,175,215,0.45)] truncate">
            {cardDisplayName || cartaPrincipal}
          </p>
        )}
        <div className="mt-[0.35rem] max-w-[180px] hidden min-[560px]:block">
          <PopularityBar value={usos} max={maxUsos} color="#7dd3fc" />
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="text-right hidden min-[480px]:block">
          <p className="m-0 text-[0.62rem] uppercase tracking-[0.07em] text-[rgba(190,175,215,0.45)] leading-none mb-[0.2rem]">
            Usos
          </p>
          <p className="m-0 text-[0.88rem] font-semibold text-[#7dd3fc]">{usos}</p>
        </div>
        <div className="text-right hidden min-[560px]:block">
          <p className="m-0 text-[0.62rem] uppercase tracking-[0.07em] text-[rgba(190,175,215,0.45)] leading-none mb-[0.2rem]">
            V/D
          </p>
          <p className="m-0 text-[0.88rem] font-semibold text-[#c4b5fd] tabular-nums">
            {formatRecordeVd(wins, losses, deck.empates ?? 0)}
          </p>
        </div>
        {winRate !== null && (
          <div className="text-right min-w-[3.5rem]">
            <p className="m-0 text-[0.62rem] uppercase tracking-[0.07em] text-[rgba(190,175,215,0.45)] leading-none mb-[0.2rem]">
              Win%
            </p>
            <p className="m-0 text-[0.88rem] font-semibold" style={{ color: wr.color }}>
              {typeof winRate === "number" ? `${winRate % 1 === 0 ? winRate : winRate.toFixed(1)}%` : "—"}
            </p>
          </div>
        )}
      </div>
    </li>
  );
}

// ── Loading skeleton ───────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {/* Tab bar skeleton */}
      <div className="flex gap-1 bg-[rgba(255,255,255,0.03)] border border-line-soft rounded-xl p-1 h-[46px] animate-pulse" />

      {/* Podium skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-line-soft bg-white/[0.03] h-[230px] animate-pulse"
          />
        ))}
      </div>

      {/* List skeleton */}
      <div className="rounded-xl border border-line-soft bg-white/[0.03] overflow-hidden">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-[58px] border-b border-[rgba(217,180,255,0.07)] animate-pulse bg-white/[0.015] last:border-b-0"
          />
        ))}
      </div>
    </div>
  );
}

// ── Section info bar ───────────────────────────────────────────────────────────

function SectionInfo({ count, label, hint }) {
  return (
    <div className="flex items-center justify-between px-5 py-[0.6rem] border-b border-line-soft bg-white/[0.015]">
      <span className="text-[0.78rem] text-text-soft">
        <span className="font-semibold text-text-main">{count}</span> {label}
      </span>
      {hint && (
        <span className="text-[0.72rem] text-[rgba(190,175,215,0.4)]">{hint}</span>
      )}
    </div>
  );
}

function TeamRankingTable({ rankingTimes, totalTimes }) {
  return (
    <div className="bg-[linear-gradient(155deg,rgba(26,16,50,0.98)_0%,rgba(16,10,32,0.98)_100%)] rounded-xl border border-line-soft overflow-hidden">
      <SectionInfo
        count={totalTimes}
        label={`time${totalTimes !== 1 ? "s" : ""}`}
        hint="ranking coletivo"
      />

      {rankingTimes.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <p className="m-0 text-[0.95rem] font-medium text-[rgba(190,175,215,0.55)]">
            Nenhum dado de ranking coletivo disponível ainda.
          </p>
          <p className="m-0 mt-2 text-[0.82rem] text-[rgba(190,175,215,0.32)]">
            O ranking de times será exibido aqui assim que a API retornar `rankingTimes`.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[640px]">
            <thead>
              <tr className="bg-white/[0.03] text-left">
                {["Posição", "Time", "V/D", "Pontos"].map((column) => (
                  <th
                    key={column}
                    scope="col"
                    className="px-5 py-3 text-[0.72rem] uppercase tracking-[0.08em] text-[rgba(190,175,215,0.5)] font-semibold"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rankingTimes.map((time, idx) => (
                <tr
                  key={time.time?.id ?? time.id ?? idx}
                  className="border-t border-[rgba(217,180,255,0.07)] hover:bg-white/[0.02] transition-colors duration-150"
                >
                  <td className="px-5 py-4 text-[0.88rem] font-semibold text-text-main">{time.posicao ?? idx + 1}</td>
                  <td className="px-5 py-4 text-[0.9rem] font-medium text-[#c4b5fd]">{time.time?.nome || "—"}</td>
                  <td className="px-5 py-4">
                    <RecordeVd
                      vitorias={time.vitorias ?? 0}
                      derrotas={time.derrotas ?? 0}
                      empates={time.empates ?? 0}
                    />
                  </td>
                  <td className="px-5 py-4 font-['Bebas_Neue',sans-serif] text-[1.2rem] tracking-[0.04em] text-[rgba(240,180,41,0.8)]">
                    {time.pontos ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

export function LigaRankingSection({ ranking, loading, usuarioLogado }) {
  const [subAba, setSubAba] = useState("jogadores");
  const [jogadoresPage, setJogadoresPage] = useState(1);
  const [decksPage, setDecksPage] = useState(1);
  const [cardImages, setCardImages] = useState({});
  const [cardArtImages, setCardArtImages] = useState({});
  const [cardDisplayNames, setCardDisplayNames] = useState({});
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

  useEffect(() => {
    if (!ranking) return;

    const deckList = ranking.rankingDecks || ranking.decks || [];
    const cartaList = ranking.rankingCartas || ranking.cartas || ranking.cards || [];
    const cardNames = [
      ...deckList.map((deck) => deck.cartaRepresentativa || deck.cartaPrincipal),
      ...cartaList.map((carta) => carta.nome || carta.name),
    ].filter(Boolean);

    if (cardNames.length === 0) return;

    let cancelled = false;

    const loadImages = async () => {
      const cards = await buscarCartasPorNome(cardNames);
      if (cancelled) return;

      const images = {};
      const artImages = {};
      const displayNames = {};
      cardNames.forEach((name, index) => {
        const imagem = cards[index]?.imagem;
        const arte = cards[index]?.artCrop;
        if (imagem) {
          images[name] = imagem;
          _imgCache.set(name, imagem);
        }
        if (arte) artImages[name] = arte;
        if (cards[index]?.nome) displayNames[name] = cards[index].nome;
      });
      setCardImages(images);
      setCardArtImages(artImages);
      setCardDisplayNames(displayNames);
    };

    loadImages();

    return () => {
      cancelled = true;
    };
  }, [ranking]);

  if (loading) return <LoadingSkeleton />;

  if (!ranking) return null;

  const jogadores = ranking.rankingJogadores || ranking.jogadores || ranking.players || [];
  const decks = ranking.rankingDecks || ranking.decks || [];
  const cartas = ranking.rankingCartas || ranking.cartas || ranking.cards || [];
  const rankingTimes = Array.isArray(ranking.rankingTimes) ? ranking.rankingTimes : [];
  const totalTimes = ranking.totalTimes ?? rankingTimes.length;
  const isTeamLeague = ranking.tipo === "times";

  const hasData = jogadores.length > 0 || decks.length > 0 || cartas.length > 0 || (isTeamLeague && totalTimes > 0);

  if (!hasData) {
    return (
      <EmptyState
        icon="🏆"
        title="Nenhum dado de ranking disponível ainda."
        description="O ranking será gerado automaticamente conforme as partidas da liga forem finalizadas."
      />
    );
  }

  const tabs = [
    jogadores.length > 0 && { key: "jogadores", label: "Jogadores", count: jogadores.length },
    decks.length > 0 && { key: "decks", label: "Arquétipos", count: decks.length },
    cartas.length > 0 && { key: "cartas", label: "Cartas", count: cartas.length },
  ].filter(Boolean);

  // Ensure active tab is valid
  const activeTab = tabs.find((t) => t.key === subAba) ? subAba : tabs[0]?.key ?? "jogadores";

  const jogadoresTotal = jogadores.length;
  const jogadoresPages = Math.ceil(jogadoresTotal / PAGE_SIZE);
  const jogadoresClamped = Math.min(jogadoresPage, jogadoresPages || 1);
  const jogadoresPagina = jogadores.slice((jogadoresClamped - 1) * PAGE_SIZE, jogadoresClamped * PAGE_SIZE);

  const decksAll = decks;
  const decksTotal = decksAll.length;
  const decksPages = Math.ceil(decksTotal / PAGE_SIZE);
  const decksClamped = Math.min(decksPage, decksPages || 1);
  const decksPage_ = decksAll.slice((decksClamped - 1) * PAGE_SIZE, decksClamped * PAGE_SIZE);
  const userId = usuarioLogado?.id;

  const maxCopias = cartas[0]?.totalCopias ?? 1;
  const maxUsos = decks[0]?.totalUsos ?? 1;
  const topDecks = decks.slice(0, Math.min(3, decks.length));
  const topCartas = cartas.slice(0, Math.min(3, cartas.length));
  const topJogadores = jogadores.slice(0, Math.min(3, jogadores.length));

  const meuRanking = userId ? jogadores.find((j) => j.jogador?.id === userId) : null;

  const cardClass =
    "bg-[linear-gradient(155deg,rgba(26,16,50,0.98)_0%,rgba(16,10,32,0.98)_100%)] rounded-xl border border-line-soft overflow-hidden";
  const teamRankingSection = isTeamLeague ? (
    <section className="space-y-3" aria-label="Ranking coletivo">
      <div>
        <h3 className="m-0 text-[1.05rem] font-semibold text-text-main">Ranking coletivo</h3>
        <p className="m-0 mt-1 text-[0.82rem] text-[rgba(190,175,215,0.45)]">
          Classificação consolidada dos times da liga.
        </p>
      </div>
      <TeamRankingTable rankingTimes={rankingTimes} totalTimes={totalTimes} />
    </section>
  ) : null;

  return (
    <div className="space-y-6">
      <CardPreviewTooltip {...cardPreview} />

      <RankingOverview ranking={ranking} jogadores={jogadores} decks={decks} cartas={cartas} />

      {teamRankingSection}

      {/* ── Sub-tabs ── */}
      {tabs.length > 1 && (
        <div className="flex gap-1 bg-[rgba(255,255,255,0.03)] border border-line-soft rounded-xl p-1 mb-5">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSubAba(tab.key)}
              className={`flex-1 flex items-center justify-center gap-[0.4rem] px-4 py-[0.5rem] rounded-md text-[0.85rem] font-medium transition-all duration-200 ${activeTab === tab.key
                  ? "bg-[rgba(79,70,229,0.35)] text-white border border-[rgba(99,102,241,0.45)] shadow-sm"
                  : "text-[#888] hover:text-[#c0bfff] border border-transparent"
                }`}
            >
              {tab.label}
              <span
                className={`text-[0.68rem] px-[0.45rem] py-[0.1rem] rounded-full leading-[1.5] ${activeTab === tab.key
                    ? "bg-white/[0.18] text-white"
                    : "bg-[rgba(217,180,255,0.1)] text-text-soft"
                  }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* ── Jogadores ── */}
      {activeTab === "jogadores" && (
        <div className="space-y-4">
          {topJogadores.length > 0 && (
            <div className={`grid gap-3 ${topJogadores.length === 1 ? "grid-cols-1 max-w-[220px] mx-auto" : topJogadores.length === 2 ? "grid-cols-2 max-w-md mx-auto" : "grid-cols-1 sm:grid-cols-3"}`}>
              {topJogadores.map((jogador) => (
                <SpotlightCard
                  key={jogador.jogador?.id || jogador.posicao}
                  pos={jogador.posicao}
                  title={jogador.jogador?.nome || "Jogador"}
                  subtitle={`${jogador.pontos ?? 0} pts`}
                  accent="#fbbf24"
                  stats={(
                    <div className="text-center text-[0.72rem] text-[#fde68a]">
                      {formatRecordeVd(jogador.vitorias ?? 0, jogador.derrotas ?? 0, jogador.empates ?? 0)}
                    </div>
                  )}
                />
              ))}
            </div>
          )}
          {jogadoresTotal > 0 && (
            <div className={cardClass}>
              <SectionInfo
                count={jogadoresTotal}
                label={`jogador${jogadoresTotal !== 1 ? "es" : ""}`}
                hint="ordenado por pontos · desempate % vitória"
              />
              <ul className="divide-y divide-[rgba(217,180,255,0.07)] m-0 p-0 list-none">
                {jogadoresPagina.map((j, idx) => (
                  <PlayerRow
                    key={j.jogador?.id ?? idx}
                    jogador={j}
                    idx={(jogadoresClamped - 1) * PAGE_SIZE + idx}
                    isLogado={Boolean(userId && j.jogador?.id === userId)}
                  />
                ))}
              </ul>
              {jogadoresPages > 1 && (
                <div className="flex items-center justify-center gap-2 px-5 py-3 border-t border-line-soft">
                  <button
                    type="button"
                    className="px-3 py-1 rounded-lg border border-line-soft bg-white/[0.03] text-text-soft text-[0.8rem] disabled:opacity-40 hover:not-disabled:border-[rgba(199,149,255,0.4)] hover:not-disabled:text-white transition-colors"
                    onClick={() => setJogadoresPage((p) => Math.max(1, p - 1))}
                    disabled={jogadoresClamped <= 1}
                  >
                    ←
                  </button>
                  <span className="text-[0.8rem] text-text-soft">
                    {jogadoresClamped} / {jogadoresPages}
                  </span>
                  <button
                    type="button"
                    className="px-3 py-1 rounded-lg border border-line-soft bg-white/[0.03] text-text-soft text-[0.8rem] disabled:opacity-40 hover:not-disabled:border-[rgba(199,149,255,0.4)] hover:not-disabled:text-white transition-colors"
                    onClick={() => setJogadoresPage((p) => Math.min(jogadoresPages, p + 1))}
                    disabled={jogadoresClamped >= jogadoresPages}
                  >
                    →
                  </button>
                </div>
              )}
            </div>
          )}

          {meuRanking && !jogadoresPagina.some((j) => j.jogador?.id === userId) && (
            <div className="rounded-lg border border-[rgba(99,102,241,0.35)] bg-[rgba(79,70,229,0.1)] px-4 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <MedalBadge pos={meuRanking.posicao} />
                <div className="min-w-0">
                  <p className="m-0 text-[0.78rem] text-[rgba(190,175,215,0.5)]">Sua posição</p>
                  <p className="m-0 font-semibold text-[#c4b5fd] truncate">{meuRanking.jogador?.nome}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="m-0 font-['Bebas_Neue',sans-serif] text-[1.4rem] text-[rgba(240,180,41,0.85)] leading-none">
                  {meuRanking.pontos ?? 0}
                </p>
                <p className="m-0 text-[0.68rem] text-[rgba(190,175,215,0.45)]">
                  {formatRecordeVd(meuRanking.vitorias ?? 0, meuRanking.derrotas ?? 0, meuRanking.empates ?? 0)}
                </p>
              </div>
            </div>
          )}

          {/* Edge case: user has 0 games and is not in ranking at all */}
          {userId &&
            !jogadores.some((j) => j.jogador?.id === userId) &&
            jogadores.length > 0 && (
              <p className="text-center text-[0.8rem] text-[rgba(190,175,215,0.35)] mt-2">
                Você ainda não aparece no ranking. Jogue partidas para entrar na classificação.
              </p>
            )}
        </div>
      )}

      {/* ── Arquétipos ── */}
      {activeTab === "decks" && (
        <div className="space-y-4">
          {topDecks.length > 0 && (
            <div className={`grid gap-3 ${topDecks.length === 1 ? "grid-cols-1 max-w-[220px] mx-auto" : topDecks.length === 2 ? "grid-cols-2 max-w-md mx-auto" : "grid-cols-1 sm:grid-cols-3"}`}>
              {topDecks.map((deck) => {
                const wr = deck.winrate ?? (deck.totalUsos > 0 ? Math.round((deck.vitorias / deck.totalUsos) * 1000) / 10 : 0);
                const cartaRepresentativa = deck.cartaRepresentativa || deck.cartaPrincipal;
                return (
                  <SpotlightCard
                    key={deck.nome}
                    pos={deck.posicao}
                    title={deck.nome}
                    subtitle={cardDisplayNames[cartaRepresentativa] || cartaRepresentativa}
                    cardName={cartaRepresentativa}
                    imageUrl={cartaRepresentativa ? (cardArtImages[cartaRepresentativa] || cardImages[cartaRepresentativa]) : null}
                    artwork
                    accent="#7dd3fc"
                    onHover={handleCardHover}
                    onLeave={handleCardLeave}
                    stats={
                      <div className="flex items-center justify-between w-full text-[0.72rem]">
                        <span className="text-[#7dd3fc]">{deck.totalUsos ?? 0} usos</span>
                        <span className="font-semibold" style={{ color: winRateStyle(Math.round(wr)).color }}>
                          {wr % 1 === 0 ? wr : wr.toFixed(1)}% win
                        </span>
                      </div>
                    }
                  />
                );
              })}
            </div>
          )}

          <div className={cardClass}>
          <SectionInfo
            count={decksTotal}
            label={`arquétipo${decksTotal !== 1 ? "s" : ""}`}
            hint="ordenado por usos · passe o mouse na carta para ampliar"
          />
          <ul className="divide-y divide-[rgba(217,180,255,0.07)] m-0 p-0 list-none">
            {decksPage_.map((d, idx) => (
              <DeckRow
                key={d.nome ?? idx}
                deck={d}
                cardImageUrl={(d.cartaRepresentativa || d.cartaPrincipal) ? cardImages[d.cartaRepresentativa || d.cartaPrincipal] : null}
                cardDisplayName={cardDisplayNames[d.cartaRepresentativa || d.cartaPrincipal]}
                maxUsos={maxUsos}
                onCardHover={handleCardHover}
                onCardLeave={handleCardLeave}
              />
            ))}
          </ul>
          {decksPages > 1 && (
            <div className="flex items-center justify-center gap-2 px-5 py-3 border-t border-line-soft">
              <button
                type="button"
                className="px-3 py-1 rounded-lg border border-line-soft bg-white/[0.03] text-text-soft text-[0.8rem] disabled:opacity-40 hover:not-disabled:border-[rgba(199,149,255,0.4)] hover:not-disabled:text-white transition-colors"
                onClick={() => setDecksPage((p) => Math.max(1, p - 1))}
                disabled={decksClamped <= 1}
              >
                ←
              </button>
              <span className="text-[0.8rem] text-text-soft">
                {decksClamped} / {decksPages}
              </span>
              <button
                type="button"
                className="px-3 py-1 rounded-lg border border-line-soft bg-white/[0.03] text-text-soft text-[0.8rem] disabled:opacity-40 hover:not-disabled:border-[rgba(199,149,255,0.4)] hover:not-disabled:text-white transition-colors"
                onClick={() => setDecksPage((p) => Math.min(decksPages, p + 1))}
                disabled={decksClamped >= decksPages}
              >
                →
              </button>
            </div>
          )}
          </div>
        </div>
      )}

      {/* ── Cartas ── */}
      {activeTab === "cartas" && (
        <div className="space-y-4">
          {topCartas.length > 0 && (
            <div className={`grid gap-3 ${topCartas.length === 1 ? "grid-cols-1 max-w-[220px] mx-auto" : topCartas.length === 2 ? "grid-cols-2 max-w-md mx-auto" : "grid-cols-1 sm:grid-cols-3"}`}>
              {topCartas.map((carta) => {
                const nome = carta.nome || carta.name;
                return (
                  <SpotlightCard
                    key={nome}
                    pos={carta.posicao}
                    title={nome}
                    subtitle={`${carta.totalCopias ?? 0} cópias em ${carta.totalDecks ?? 0} decks`}
                    cardName={nome}
                    imageUrl={cardImages[nome]}
                    accent="#c795ff"
                    onHover={handleCardHover}
                    onLeave={handleCardLeave}
                  />
                );
              })}
            </div>
          )}

          <div className={cardClass}>
          <SectionInfo
            count={cartas.length}
            label={`carta${cartas.length !== 1 ? "s" : ""} mais usadas`}
            hint="basic lands excluídas · passe o mouse para ampliar"
          />
          <ul className="divide-y divide-[rgba(217,180,255,0.07)] m-0 p-0 list-none">
            {cartas.map((c, idx) => {
              const nome = c.nome || c.name;
              return (
                <CartaRow
                  key={c.id ?? nome ?? idx}
                  carta={c}
                  idx={idx}
                  maxCopias={maxCopias}
                  cardImageUrl={cardImages[nome]}
                  onCardHover={handleCardHover}
                  onCardLeave={handleCardLeave}
                />
              );
            })}
          </ul>
          </div>
        </div>
      )}
    </div>
  );
}

