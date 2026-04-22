import { useState, useCallback } from "react";
import { buscarCartaPorNome } from "../../services/scryfallApi";

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

function winRateStyle(rate) {
  if (rate === null) return { color: "rgba(190,175,215,0.4)", track: "rgba(217,180,255,0.08)" };
  if (rate >= 60) return { color: "#22c55e", track: "rgba(34,197,94,0.18)" };
  if (rate >= 40) return { color: "#fbbf24", track: "rgba(251,191,36,0.18)" };
  return { color: "#ef4444", track: "rgba(239,68,68,0.18)" };
}

// ── Podium config per position ─────────────────────────────────────────────────

const PODIUM_CFG = {
  1: {
    border: "border-[rgba(251,191,36,0.5)]",
    bg: "bg-[rgba(251,191,36,0.05)]",
    shadow: "shadow-[0_0_28px_rgba(251,191,36,0.14)]",
    badgeBg: "bg-[rgba(251,191,36,0.2)]",
    badgeBorder: "border-[rgba(251,191,36,0.6)]",
    ptsColor: "#f0b429",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="#fbbf24" aria-hidden="true">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
      </svg>
    ),
  },
  2: {
    border: "border-[rgba(148,163,184,0.35)]",
    bg: "bg-[rgba(148,163,184,0.03)]",
    shadow: "",
    badgeBg: "bg-[rgba(148,163,184,0.15)]",
    badgeBorder: "border-[rgba(148,163,184,0.4)]",
    ptsColor: "#94a3b8",
    icon: <span className="text-[0.75rem] font-bold text-[#94a3b8]">2</span>,
  },
  3: {
    border: "border-[rgba(205,127,50,0.35)]",
    bg: "bg-[rgba(205,127,50,0.03)]",
    shadow: "",
    badgeBg: "bg-[rgba(205,127,50,0.15)]",
    badgeBorder: "border-[rgba(205,127,50,0.4)]",
    ptsColor: "#cd9a5c",
    icon: <span className="text-[0.75rem] font-bold text-[#cd9a5c]">3</span>,
  },
};

// ── Shared sub-components ──────────────────────────────────────────────────────

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
          className="w-[180px] rounded-[10px] shadow-[0_16px_48px_rgba(0,0,0,0.9),0_0_0_1px_rgba(199,149,255,0.25)] block"
          loading="eager"
        />
      )}
    </div>
  );
}

function WinRateBar({ rate }) {
  if (rate === null) return null;
  const style = winRateStyle(rate);
  return (
    <div className="h-[3px] rounded-full w-full" style={{ background: style.track }}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(rate, 100)}%`, background: style.color }}
      />
    </div>
  );
}

function VoceBadge() {
  return (
    <span className="inline-block text-[0.62rem] font-bold text-[#818cf8] bg-[rgba(79,70,229,0.2)] border border-[rgba(79,70,229,0.45)] rounded-full px-[0.4rem] py-[0.05rem] uppercase tracking-[0.07em] flex-shrink-0 leading-[1.6]">
      você
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

function CartaRow({ carta, idx, onCardHover, onCardLeave }) {
  const pos = carta.posicao ?? idx + 1;
  const nome = carta.nome || carta.name || "—";
  const copias = carta.totalCopias ?? "—";
  const totalDecks = carta.totalDecks ?? "—";

  return (
    <li
      key={carta.id ?? carta.nome ?? idx}
      className="flex items-center gap-3 px-5 py-[0.75rem] hover:bg-white/[0.025] transition-colors duration-150"
    >
      <MedalBadge pos={pos} />

      <button
        type="button"
        className="flex-1 min-w-0 text-left group bg-transparent border-none p-0 cursor-default"
        onMouseEnter={(e) => onCardHover(nome, e)}
        onMouseLeave={onCardLeave}
        onFocus={(e) => onCardHover(nome, e)}
        onBlur={onCardLeave}
      >
        <span className="font-semibold text-[0.92rem] text-[#f5edff] group-hover:text-[#c4b5fd] transition-colors duration-150 underline decoration-dotted decoration-[rgba(199,149,255,0.4)] underline-offset-[3px] overflow-hidden text-ellipsis whitespace-nowrap max-w-full block">
          {nome}
        </span>
      </button>

      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="text-right hidden min-[520px]:block">
          <p className="m-0 text-[0.62rem] uppercase tracking-[0.07em] text-[rgba(190,175,215,0.45)] leading-none mb-[0.2rem]">
            Cópias
          </p>
          <p className="m-0 text-[0.88rem] font-semibold text-[#c795ff]">{copias}</p>
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

function VDEBadges({ vitorias, derrotas, empates }) {
  return (
    <div className="flex items-center gap-[0.3rem]">
      <span className="text-[0.7rem] font-semibold text-[#22c55e] bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.25)] rounded-full px-[0.5rem] py-[0.1rem]">
        {vitorias}V
      </span>
      {empates > 0 && (
        <span className="text-[0.7rem] font-semibold text-[#fbbf24] bg-[rgba(251,191,36,0.1)] border border-[rgba(251,191,36,0.25)] rounded-full px-[0.5rem] py-[0.1rem]">
          {empates}E
        </span>
      )}
      <span className="text-[0.7rem] font-semibold text-[#ef4444] bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.25)] rounded-full px-[0.5rem] py-[0.1rem]">
        {derrotas}D
      </span>
    </div>
  );
}

// ── Podium card (top 3 players) ────────────────────────────────────────────────

function PodiumCard({ jogador, idx, isLogado }) {
  const pos = jogador.posicao;
  const cfg = PODIUM_CFG[pos] ?? PODIUM_CFG[3];
  const nome = jogador.jogador?.nome || "—";
  const pts = jogador.pontos ?? 0;
  const wins = jogador.vitorias ?? 0;
  const losses = jogador.derrotas ?? 0;
  const draws = jogador.empates ?? 0;
  const winRate = calcWinRate(wins, losses, draws);
  const wr = winRateStyle(winRate);

  return (
    <div
      className={`relative rounded-[1rem] border ${cfg.border} ${cfg.bg} ${cfg.shadow} p-5 flex flex-col items-center gap-3 transition-all duration-200 hover:scale-[1.015] hover:brightness-110`}
    >
      {/* Logged-in user indicator */}
      {isLogado && (
        <div className="absolute top-3 right-3">
          <VoceBadge />
        </div>
      )}

      {/* Position badge */}
      <div className={`w-10 h-10 rounded-full ${cfg.badgeBg} border ${cfg.badgeBorder} flex items-center justify-center`}>
        {cfg.icon}
      </div>

      {/* Avatar */}
      <div
        className={`w-14 h-14 rounded-full bg-gradient-to-br ${avatarGradient(idx)} flex items-center justify-center text-[1rem] font-bold text-white select-none ring-2 ring-white/10`}
      >
        {getInitials(nome)}
      </div>

      {/* Name */}
      <p className="m-0 font-semibold text-[#f5edff] text-[0.95rem] leading-snug text-center truncate max-w-[150px] w-full">
        {nome}
      </p>

      {/* Points */}
      <div className="text-center -mt-1">
        <p
          className="m-0 font-['Bebas_Neue',sans-serif] text-[2.2rem] leading-none tracking-[0.02em]"
          style={{ color: cfg.ptsColor }}
        >
          {pts}
        </p>
        <p className="m-0 text-[0.62rem] uppercase tracking-[0.09em] text-[rgba(190,175,215,0.45)] mt-[0.1rem]">
          pontos
        </p>
      </div>

      {/* W/D/L */}
      <VDEBadges vitorias={wins} derrotas={losses} empates={draws} />

      {/* Win rate */}
      {winRate !== null && (
        <div className="w-full space-y-[0.35rem]">
          <div className="flex items-center justify-between">
            <span className="text-[0.63rem] text-[rgba(190,175,215,0.45)] uppercase tracking-[0.07em]">
              taxa vitória
            </span>
            <span className="text-[0.75rem] font-semibold" style={{ color: wr.color }}>
              {winRate}%
            </span>
          </div>
          <WinRateBar rate={winRate} />
        </div>
      )}
    </div>
  );
}

// ── Player list row (positions 4+) ─────────────────────────────────────────────

function PlayerRow({ jogador, idx, isLogado }) {
  const pos = jogador.posicao;
  const nome = jogador.jogador?.nome || "—";
  const pts = jogador.pontos ?? 0;
  const wins = jogador.vitorias ?? 0;
  const losses = jogador.derrotas ?? 0;
  const draws = jogador.empates ?? 0;
  const winRate = calcWinRate(wins, losses, draws);
  const wr = winRateStyle(winRate);

  return (
    <li
      className={`flex items-center gap-3 px-5 py-[0.85rem] transition-colors duration-150 hover:bg-white/[0.025] ${
        isLogado
          ? "bg-[rgba(79,70,229,0.07)] border-l-[3px] border-l-[rgba(99,102,241,0.55)]"
          : ""
      }`}
    >
      <MedalBadge pos={pos} />

      {/* Avatar */}
      <span
        className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarGradient(idx)} flex items-center justify-center text-[0.72rem] font-bold text-white flex-shrink-0 select-none`}
      >
        {getInitials(nome)}
      </span>

      {/* Name */}
      <div className="flex-1 min-w-0 flex items-center gap-[0.45rem] overflow-hidden">
        <span className="font-semibold overflow-hidden text-ellipsis whitespace-nowrap text-[0.92rem] text-[#c4b5fd]">
          {nome}
        </span>
        {isLogado && <VoceBadge />}
      </div>

      {/* W/D/L (hide on small) */}
      <div className="hidden min-[520px]:flex items-center gap-[0.3rem] flex-shrink-0">
        <span className="text-[0.7rem] font-semibold text-[#22c55e] bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.25)] rounded-full px-[0.5rem] py-[0.1rem]">
          {wins}V
        </span>
        {draws > 0 && (
          <span className="text-[0.7rem] font-semibold text-[#fbbf24] bg-[rgba(251,191,36,0.1)] border border-[rgba(251,191,36,0.25)] rounded-full px-[0.5rem] py-[0.1rem]">
            {draws}E
          </span>
        )}
        <span className="text-[0.7rem] font-semibold text-[#ef4444] bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.25)] rounded-full px-[0.5rem] py-[0.1rem]">
          {losses}D
        </span>
      </div>

      {/* Win rate % */}
      {winRate !== null && (
        <span
          className="hidden min-[600px]:block text-[0.75rem] font-semibold flex-shrink-0 w-[3.2rem] text-right"
          style={{ color: wr.color }}
        >
          {winRate}%
        </span>
      )}

      {/* Points */}
      <span className="font-['Bebas_Neue',sans-serif] text-[1.3rem] tracking-[0.04em] flex-shrink-0 w-[3rem] text-right text-[rgba(240,180,41,0.7)]">
        {pts}
      </span>
    </li>
  );
}

// ── Deck list row ──────────────────────────────────────────────────────────────

function DeckRow({ deck }) {
  const pos = deck.posicao;
  const nome = deck.nome || "—";
  const usos = deck.totalUsos ?? 0;
  const wins = deck.vitorias ?? 0;
  const losses = deck.derrotas ?? 0;
  const winRate = usos > 0 ? Math.round((wins / usos) * 100) : null;
  const lossRate = usos > 0 ? Math.round((losses / usos) * 100) : null;
  const wr = winRateStyle(winRate);

  return (
    <li className="flex items-center gap-3 px-5 py-[0.9rem] hover:bg-white/[0.02] transition-colors duration-150">
      <MedalBadge pos={pos} />

      {/* Deck name */}
      <span className="flex-1 min-w-0 font-semibold overflow-hidden text-ellipsis whitespace-nowrap text-[0.92rem] text-[#f5edff]">
        {nome}
      </span>

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
          <p className="m-0 text-[0.88rem] font-semibold">
            <span className="text-[#22c55e]">{wins}</span>
            <span className="text-[rgba(190,175,215,0.4)] mx-[0.2rem]">/</span>
            <span className="text-[#ef4444]">{losses}</span>
          </p>
        </div>
        {winRate !== null && (
          <div className="text-right">
            <p className="m-0 text-[0.62rem] uppercase tracking-[0.07em] text-[rgba(190,175,215,0.45)] leading-none mb-[0.2rem]">
              Win%
            </p>
            <p className="m-0 text-[0.88rem] font-semibold" style={{ color: wr.color }}>
              {winRate}%
            </p>
          </div>
        )}
        {lossRate !== null && (
          <div className="text-right hidden min-[680px]:block">
            <p className="m-0 text-[0.62rem] uppercase tracking-[0.07em] text-[rgba(190,175,215,0.45)] leading-none mb-[0.2rem]">
              Loss%
            </p>
            <p className="m-0 text-[0.88rem] font-semibold text-[#ef4444]">
              {lossRate}%
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
      <div className="flex gap-1 bg-[rgba(255,255,255,0.03)] border border-[rgba(217,180,255,0.1)] rounded-xl p-1 h-[46px] animate-pulse" />

      {/* Podium skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-[1rem] border border-[rgba(217,180,255,0.1)] bg-white/[0.03] h-[230px] animate-pulse"
          />
        ))}
      </div>

      {/* List skeleton */}
      <div className="rounded-[1rem] border border-[rgba(217,180,255,0.1)] bg-white/[0.03] overflow-hidden">
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

// ── Empty state ────────────────────────────────────────────────────────────────

function EmptyState({ icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div className="text-[2.5rem] opacity-25">{icon || "📊"}</div>
      <p className="m-0 text-[1rem] font-medium text-[rgba(190,175,215,0.55)]">{title}</p>
      {description && (
        <p className="m-0 text-[0.85rem] text-[rgba(190,175,215,0.3)] max-w-[320px] leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}

// ── Section info bar ───────────────────────────────────────────────────────────

function SectionInfo({ count, label, hint }) {
  return (
    <div className="flex items-center justify-between px-5 py-[0.6rem] border-b border-[rgba(217,180,255,0.1)] bg-white/[0.015]">
      <span className="text-[0.78rem] text-[#beafd7]">
        <span className="font-semibold text-[#f5edff]">{count}</span> {label}
      </span>
      {hint && (
        <span className="text-[0.72rem] text-[rgba(190,175,215,0.4)]">{hint}</span>
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

  if (loading) return <LoadingSkeleton />;

  if (!ranking) return null;

  const jogadores = ranking.rankingJogadores || ranking.jogadores || ranking.players || [];
  const decks = ranking.rankingDecks || ranking.decks || [];
  const cartas = ranking.rankingCartas || ranking.cartas || ranking.cards || [];

  const hasData = jogadores.length > 0 || decks.length > 0 || cartas.length > 0;

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

  const top3 = jogadores.slice(0, Math.min(3, jogadores.length));
  const restoAll = jogadores.slice(3);
  const restoTotal = restoAll.length;
  const restoPages = Math.ceil(restoTotal / PAGE_SIZE);
  const restoClamped = Math.min(jogadoresPage, restoPages || 1);
  const resto = restoAll.slice((restoClamped - 1) * PAGE_SIZE, restoClamped * PAGE_SIZE);

  const decksAll = decks;
  const decksTotal = decksAll.length;
  const decksPages = Math.ceil(decksTotal / PAGE_SIZE);
  const decksClamped = Math.min(decksPage, decksPages || 1);
  const decksPage_ = decksAll.slice((decksClamped - 1) * PAGE_SIZE, decksClamped * PAGE_SIZE);
  const userId = usuarioLogado?.id;

  const cardClass =
    "bg-[linear-gradient(155deg,rgba(26,16,50,0.98)_0%,rgba(16,10,32,0.98)_100%)] rounded-[1rem] border border-[rgba(217,180,255,0.15)] overflow-hidden";

  // Podium grid: 1 col → max-w-xs centered; 2 cols → max-w-sm centered; 3 cols → full responsive
  const podiumGridClass =
    top3.length === 1
      ? "grid grid-cols-1 max-w-[240px] mx-auto"
      : top3.length === 2
      ? "grid grid-cols-2 max-w-sm mx-auto gap-3"
      : "grid grid-cols-1 sm:grid-cols-3 gap-3";

  return (
    <>
      <CardPreviewTooltip {...cardPreview} />

      {/* ── Sub-tabs ── */}
      {tabs.length > 1 && (
        <div className="flex gap-1 bg-[rgba(255,255,255,0.03)] border border-[rgba(217,180,255,0.1)] rounded-xl p-1 mb-5">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSubAba(tab.key)}
              className={`flex-1 flex items-center justify-center gap-[0.4rem] px-4 py-[0.5rem] rounded-[0.6rem] text-[0.85rem] font-medium transition-all duration-200 ${
                activeTab === tab.key
                  ? "bg-[rgba(79,70,229,0.35)] text-white border border-[rgba(99,102,241,0.45)] shadow-sm"
                  : "text-[#888] hover:text-[#c0bfff] border border-transparent"
              }`}
            >
              {tab.label}
              <span
                className={`text-[0.68rem] px-[0.45rem] py-[0.1rem] rounded-full leading-[1.5] ${
                  activeTab === tab.key
                    ? "bg-white/[0.18] text-white"
                    : "bg-[rgba(217,180,255,0.1)] text-[#beafd7]"
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
          {/* Podium */}
          {top3.length > 0 && (
            <div className={podiumGridClass}>
              {top3.map((j, idx) => (
                <PodiumCard
                  key={j.jogador?.id ?? idx}
                  jogador={j}
                  idx={idx}
                  isLogado={Boolean(userId && j.jogador?.id === userId)}
                />
              ))}
            </div>
          )}

          {/* Rest of ranking */}
          {restoAll.length > 0 && (
            <div className={cardClass}>
              <SectionInfo
                count={restoTotal}
                label={`jogador${restoTotal !== 1 ? "es" : ""} restante${restoTotal !== 1 ? "s" : ""}`}
                hint="ordenado por pontos"
              />
              <ul className="divide-y divide-[rgba(217,180,255,0.07)] m-0 p-0 list-none">
                {resto.map((j, idx) => (
                  <PlayerRow
                    key={j.jogador?.id ?? idx}
                    jogador={j}
                    idx={(restoClamped - 1) * PAGE_SIZE + idx + 3}
                    isLogado={Boolean(userId && j.jogador?.id === userId)}
                  />
                ))}
              </ul>
              {restoPages > 1 && (
                <div className="flex items-center justify-center gap-2 px-5 py-3 border-t border-[rgba(217,180,255,0.1)]">
                  <button
                    type="button"
                    className="px-3 py-1 rounded-lg border border-[rgba(217,180,255,0.15)] bg-white/[0.03] text-[#beafd7] text-[0.8rem] disabled:opacity-40 hover:not-disabled:border-[rgba(199,149,255,0.4)] hover:not-disabled:text-white transition-colors"
                    onClick={() => setJogadoresPage((p) => Math.max(1, p - 1))}
                    disabled={restoClamped <= 1}
                  >
                    ←
                  </button>
                  <span className="text-[0.8rem] text-[#beafd7]">
                    {restoClamped} / {restoPages}
                  </span>
                  <button
                    type="button"
                    className="px-3 py-1 rounded-lg border border-[rgba(217,180,255,0.15)] bg-white/[0.03] text-[#beafd7] text-[0.8rem] disabled:opacity-40 hover:not-disabled:border-[rgba(199,149,255,0.4)] hover:not-disabled:text-white transition-colors"
                    onClick={() => setJogadoresPage((p) => Math.min(restoPages, p + 1))}
                    disabled={restoClamped >= restoPages}
                  >
                    →
                  </button>
                </div>
              )}
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
        <div className={cardClass}>
          <SectionInfo
            count={decksTotal}
            label={`arquétipo${decksTotal !== 1 ? "s" : ""}`}
            hint="ordenado por usos"
          />
          <ul className="divide-y divide-[rgba(217,180,255,0.07)] m-0 p-0 list-none">
            {decksPage_.map((d, idx) => (
              <DeckRow key={d.nome ?? idx} deck={d} />
            ))}
          </ul>
          {decksPages > 1 && (
            <div className="flex items-center justify-center gap-2 px-5 py-3 border-t border-[rgba(217,180,255,0.1)]">
              <button
                type="button"
                className="px-3 py-1 rounded-lg border border-[rgba(217,180,255,0.15)] bg-white/[0.03] text-[#beafd7] text-[0.8rem] disabled:opacity-40 hover:not-disabled:border-[rgba(199,149,255,0.4)] hover:not-disabled:text-white transition-colors"
                onClick={() => setDecksPage((p) => Math.max(1, p - 1))}
                disabled={decksClamped <= 1}
              >
                ←
              </button>
              <span className="text-[0.8rem] text-[#beafd7]">
                {decksClamped} / {decksPages}
              </span>
              <button
                type="button"
                className="px-3 py-1 rounded-lg border border-[rgba(217,180,255,0.15)] bg-white/[0.03] text-[#beafd7] text-[0.8rem] disabled:opacity-40 hover:not-disabled:border-[rgba(199,149,255,0.4)] hover:not-disabled:text-white transition-colors"
                onClick={() => setDecksPage((p) => Math.min(decksPages, p + 1))}
                disabled={decksClamped >= decksPages}
              >
                →
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Cartas ── */}
      {activeTab === "cartas" && (
        <div className={cardClass}>
          <SectionInfo
            count={cartas.length}
            label={`carta${cartas.length !== 1 ? "s" : ""} mais usadas`}
            hint="passe o mouse para ver a carta"
          />
          <ul className="divide-y divide-[rgba(217,180,255,0.07)] m-0 p-0 list-none">
            {cartas.map((c, idx) => (
              <CartaRow
                key={c.id ?? c.nome ?? idx}
                carta={c}
                idx={idx}
                onCardHover={handleCardHover}
                onCardLeave={handleCardLeave}
              />
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
