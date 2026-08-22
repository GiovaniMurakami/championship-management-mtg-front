import { Fragment, useState } from "react";
import { Top8StoryModal } from "./Top8StoryModal";
import { DeckViewButton, RANK_BADGE } from "./DeckDrawer";
import { Tooltip } from "../ui/Tooltip";
import { UsuarioNomeExibicao } from "../ui/UsuarioExcluidoTag";

function CollapseToggle({ collapsed, onToggle, label = "standings" }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={!collapsed}
      aria-controls="standings-panel"
      className="inline-flex h-9 items-center gap-1.5 px-3 border border-[rgba(217,180,255,0.25)] rounded-md bg-white/[0.04] text-[#d7cce9] text-[0.75rem] font-semibold cursor-pointer transition-[color,border-color,background-color] duration-150 hover:text-white hover:border-[rgba(199,149,255,0.45)] hover:bg-white/[0.08] shrink-0"
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        aria-hidden="true"
        className={`transition-transform duration-200 ${collapsed ? "" : "rotate-180"}`}
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
      {collapsed ? `Mostrar ${label}` : `Ocultar ${label}`}
    </button>
  );
}

function getPlayerId(player) {
  return player?.usuario?.id || player?.usuarioId || player?.userId || player?.id;
}

function getMatchPlayerName(match, playerId) {
  if ((match?.jogador1Id || match?.jogador1?.id) === playerId) {
    return match?.jogador1Nome || match?.jogador1?.nome || "Jogador";
  }
  return match?.jogador2Nome || match?.jogador2?.nome || "Jogador";
}

function buildPlayerHistory(player, partidas = []) {
  const playerId = getPlayerId(player);
  if (!playerId) return [];

  return (partidas || [])
    .filter((partida) =>
      partida?.jogador1Id === playerId ||
      partida?.jogador1?.id === playerId ||
      partida?.jogador2Id === playerId ||
      partida?.jogador2?.id === playerId
    )
    .sort((a, b) => Number(b?.rodada || 0) - Number(a?.rodada || 0))
    .slice(0, 5)
    .map((partida) => {
      const isJ1 = (partida.jogador1Id || partida.jogador1?.id) === playerId;
      const opponentId = isJ1
        ? (partida.jogador2Id || partida.jogador2?.id)
        : (partida.jogador1Id || partida.jogador1?.id);
      const opponentName = opponentId ? getMatchPlayerName(partida, opponentId) : "BYE";
      const v1 = Number(partida.vitoriasJogador1 ?? 0);
      const v2 = Number(partida.vitoriasJogador2 ?? 0);
      const ownWins = isJ1 ? v1 : v2;
      const opponentWins = isJ1 ? v2 : v1;
      const result = partida.status !== "finalizada"
        ? "Pendente"
        : opponentName === "BYE"
          ? "BYE"
          : ownWins > opponentWins
            ? "Vitoria"
            : ownWins < opponentWins
              ? "Derrota"
              : "Empate";

      return {
        id: partida.id,
        rodada: partida.rodada,
        opponentName,
        score: partida.status === "finalizada" ? `${ownWins}-${opponentWins}` : "VS",
        result,
      };
    });
}

function getHistoryResultClass(result) {
  if (result === "Vitoria" || result === "BYE") {
    return "text-[#86efac]";
  }
  if (result === "Derrota") {
    return "text-[#fca5a5]";
  }
  if (result === "Empate") {
    return "text-[#fde68a]";
  }
  return "text-[#c4b5fd]";
}

function getHistoryResultLabel(result) {
  if (result === "Vitoria" || result === "BYE") return "W";
  if (result === "Derrota") return "L";
  if (result === "Empate") return "D";
  if (result === "Pendente") return "P";
  return result;
}

function PlayerHistoryTooltip({ player, partidas, children }) {
  const history = buildPlayerHistory(player, partidas);

  if (history.length === 0) {
    return children;
  }

  return (
    <Tooltip
      placement="bottom"
      ariaLabel={`Ultimas partidas de ${player?.usuario?.nome || player?.nome || "jogador"}`}
      tooltipClassName="max-w-[22rem] min-w-[18rem] text-left px-3 py-2.5"
      content={(
        <span className="block">
          <span className="mb-2 block text-[0.72rem] font-bold uppercase tracking-[0.06em] text-[#fde68a]">
            Ultimas partidas deste torneio
          </span>
          <span className="grid gap-1.5">
            {history.map((match) => (
              <span
                key={match.id}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-x-2 gap-y-0.5 rounded-md border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.035)] px-2 py-1.5 text-[0.72rem] text-[#f5edff]"
              >
                <span className="font-bold text-[#c4b5fd]">R{match.rodada}</span>
                <span className="min-w-0 truncate text-[#fef3c7]">vs {match.opponentName}</span>
                <span className="font-bold tabular-nums text-white">
                  {match.score}
                  <span className={`ml-1 ${getHistoryResultClass(match.result)}`}>
                    ({getHistoryResultLabel(match.result)})
                  </span>
                </span>
              </span>
            ))}
          </span>
          <span className="mt-2 block text-[0.64rem] leading-snug text-[#8f82ad]">
            Placar exibido na perspectiva do jogador.
          </span>
        </span>
      )}
    >
      {children}
    </Tooltip>
  );
}

export function StandingsTable({
  standings,
  isFinished = false,
  isRegistrationOpen = false,
  token,
  isOwner = false,
  isAdmin = false,
  isAnfitriao = false,
  canManageTournament = false,
  torneioNome = "",
  torneioHorario = "",
  storyFundoUrl = "",
  storyFundoTextoRodape = "escuro",
  partidas = [],
  compact = false,
  totalInscritos,
}) {
  const [deckNameOverrides, setDeckNameOverrides] = useState({});
  const [showStory, setShowStory] = useState(false);
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  const sectionTitle = isRegistrationOpen ? "Jogadores Inscritos" : "Standings";
  const collapseLabel = isRegistrationOpen ? "inscritos" : "standings";

  if (!standings || standings.length === 0) {
    return (
      <section className="border border-[rgba(217,180,255,0.2)] rounded-2xl p-5 bg-[linear-gradient(160deg,rgba(34,19,69,0.6),rgba(15,10,29,0.85))] shadow-[0_4px_20px_rgba(3,2,8,0.3)] animate-[slide-up_400ms_ease-out]">
        <h2 className="m-0 mb-4 font-['Bebas_Neue',sans-serif] text-[1.5rem] tracking-[0.04em] text-[#f5edff]">Standings</h2>
        <p className="text-[#beafd7] text-[0.9rem] m-0">Nenhum dado de standings disponível.</p>
      </section>
    );
  }

  const getPlayerName = (player) =>
    player?.usuario?.nome ||
    player?.nome ||
    player?.username ||
    player?.userName ||
    player?.jogadorNome ||
    "Jogador";

  const isPlayerExcluido = (player) => Boolean(player?.usuario?.excluido || player?.excluido);

  const getDeckStatus = (player) =>
    player?.deckId || player?.deck?.id || player?.deckConfirmado;

  const isCheckedIn = (player) =>
    (player?.checkinRodada ?? -1) >= 0;

  const formatPct = (val) => (val != null ? `${(val * 100).toFixed(1)}%` : "-");
  const getExpressiveResults = (player) =>
    Number(player?.resultadosExpressivos ?? player?.usuario?.resultadosExpressivos ?? 0);
  const expressiveBadge = (player) => {
    const total = getExpressiveResults(player);
    if (total <= 0) return null;
    return (
      <Tooltip
        content="Resultados expressivos"
        aria-label={`${total} resultado(s) expressivo(s)`}
      >
        <span className="inline-flex min-w-[1.1rem] items-center justify-center rounded-full border border-[rgba(251,191,36,0.35)] bg-[rgba(251,191,36,0.12)] px-[0.3rem] py-[0.04rem] text-[0.66rem] font-bold text-[#fde68a] leading-tight">
          {total}
        </span>
      </Tooltip>
    );
  };

  const handleDeckNameUpdate = (deckId, newName) => {
    setDeckNameOverrides((prev) => ({ ...prev, [deckId]: newName }));
  };

  const canManageDeckNames = canManageTournament || isOwner || isAdmin || isAnfitriao;

  const enrichedStandings = standings.map((player) => {
    const deckId = player.deckId || player.deck?.id;
    return {
      ...player,
      deckNome: deckId
        ? deckNameOverrides[deckId] || player.nomeConsolidado || player.deckNome || player.deck?.nome
        : player.nomeConsolidado || player.deckNome || player.deck?.nome,
    };
  });

  const filtered = search
    ? enrichedStandings.filter((player) =>
        getPlayerName(player).toLowerCase().includes(search.toLowerCase()),
      )
    : enrichedStandings;

  const hasTop8Cut = standings.length > 8 && !search && !isRegistrationOpen;
  const colCount = isRegistrationOpen ? 4 : isFinished ? 11 : 12;

  if (compact) {
    return (
      <section className="border border-[rgba(217,180,255,0.2)] rounded-2xl bg-[linear-gradient(160deg,rgba(34,19,69,0.6),rgba(15,10,29,0.85))] shadow-[0_4px_20px_rgba(3,2,8,0.3)] animate-[slide-up_400ms_ease-out] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-3 flex-shrink-0">
          <h2 className="m-0 font-['Bebas_Neue',sans-serif] text-[1.4rem] tracking-[0.04em] text-[#f5edff]">{sectionTitle}</h2>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[0.72rem] font-semibold text-[#beafd7] bg-[rgba(167,79,255,0.12)] border border-[rgba(217,180,255,0.2)] rounded-full px-[0.55rem] py-[0.15rem]">
              {totalInscritos ?? standings.length} inscritos
            </span>
            <CollapseToggle
              collapsed={collapsed}
              onToggle={() => setCollapsed((value) => !value)}
              label={collapseLabel}
            />
          </div>
        </div>

        {!collapsed && (
          <>
        <div className="relative px-4 pb-3 flex-shrink-0">
          <input
            className="w-full pl-3 pr-[1.85rem] py-[0.3rem] border border-[rgba(199,149,255,0.25)] rounded-full bg-[rgba(167,79,255,0.07)] text-[#f5edff] text-[0.78rem] font-['inherit'] outline-none transition-[border-color] duration-[250ms] placeholder:text-[#beafd7] focus:border-[rgba(199,149,255,0.5)]"
            type="text"
            placeholder="Buscar jogador..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar jogador"
          />
          {search ? (
            <button type="button" className="absolute right-[1.15rem] top-1/2 -translate-y-1/2 bg-transparent border-none text-[#beafd7] text-[1rem] leading-none cursor-pointer hover:text-[#f5edff]" onClick={() => setSearch("")} aria-label="Limpar busca">x</button>
          ) : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true" className="absolute right-[1.35rem] top-1/2 -translate-y-1/2 text-[#beafd7] pointer-events-none">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          )}
        </div>

        <div className="grid grid-cols-[2rem_1fr_auto] gap-x-2 px-4 pb-[0.35rem] flex-shrink-0 border-b border-[rgba(255,255,255,0.06)]">
          <span className="text-[0.65rem] font-bold uppercase tracking-[0.08em] text-[#c795ff] text-center">#</span>
          <span className="text-[0.65rem] font-bold uppercase tracking-[0.08em] text-[#c795ff]">Jogador</span>
          <span className="text-[0.65rem] font-bold uppercase tracking-[0.08em] text-[#c795ff] text-right">Pts</span>
        </div>

        <div className="pb-2">
          {filtered.length === 0 ? (
            <p className="text-[#beafd7] text-[0.82rem] m-0 px-4 pt-3">Nenhum jogador encontrado.</p>
          ) : (
            filtered.map((player, index) => {
              const posicao = player.posicao ?? index + 1;
              const pts = player.pontosMesa ?? player.pontos ?? 0;
              const isTop3 = posicao <= 3 && !player.dropped;
              const isTop8cut = hasTop8Cut && posicao === 8 && !player.dropped;
              const rowAccent = isTop3
                ? posicao === 1 ? "border-l-2 border-l-[rgba(255,215,0,0.5)]" : posicao === 2 ? "border-l-2 border-l-[rgba(192,192,192,0.45)]" : "border-l-2 border-l-[rgba(205,127,50,0.45)]"
                : posicao <= 8 && !player.dropped ? "border-l-2 border-l-[rgba(167,79,255,0.3)]" : "";

              return (
                <Fragment key={player.usuario?.id || player.usuarioId || player.id || index}>
                  {isTop8cut && (
                    <div className="px-4 py-[0.2rem] border-t border-b border-dashed border-[rgba(167,79,255,0.3)] bg-[rgba(167,79,255,0.04)]">
                      <span className="block text-center text-[0.63rem] font-bold uppercase tracking-[0.1em] text-[rgba(167,79,255,0.6)]">- Corte Top 8 -</span>
                    </div>
                  )}
                  <div className={`grid grid-cols-[2rem_1fr_auto] gap-x-2 items-center px-4 py-[0.4rem] border-b border-[rgba(255,255,255,0.04)] transition-colors duration-150 hover:bg-[rgba(167,79,255,0.05)] ${rowAccent}`}>
                    <span className="text-center flex-shrink-0">
                      {isTop3 ? (
                        <span className={`inline-flex items-center justify-center w-[1.4rem] h-[1.4rem] rounded-full text-[0.65rem] font-extrabold leading-none ${posicao === 1 ? "bg-[linear-gradient(135deg,#ffd700,#b8860b)] text-[#3d2800]" : posicao === 2 ? "bg-[linear-gradient(135deg,#d0d0d0,#888)] text-[#1e1e1e]" : "bg-[linear-gradient(135deg,#cd7f32,#8b4513)] text-[#fff8f0]"}`}>{posicao}</span>
                      ) : (
                        <span className="text-[0.75rem] text-[#beafd7] font-semibold">{posicao}</span>
                      )}
                    </span>
                    <span className="flex items-center gap-[0.35rem] text-[0.82rem] font-semibold truncate min-w-0 text-white">
                      {player.time?.imagemUrl && (
                        <Tooltip content={player.time.nome || "Time"} ariaLabel={`Time ${player.time.nome || "do jogador"}`}>
                          <img src={player.time.imagemUrl} alt="" className="w-5 h-5 rounded object-cover flex-shrink-0 opacity-90" />
                        </Tooltip>
                      )}
                      <span className="truncate">
                        <PlayerHistoryTooltip player={player} partidas={partidas}>
                          <span>
                            <UsuarioNomeExibicao
                              nome={getPlayerName(player)}
                              excluido={isPlayerExcluido(player)}
                            />
                          </span>
                        </PlayerHistoryTooltip>
                      </span>
                      {expressiveBadge(player)}
                    </span>
                    <span className={`text-[0.82rem] font-bold flex-shrink-0 ${posicao <= 8 && !player.dropped ? "text-[#fde68a]" : "text-[#beafd7]"}`}>
                      {isRegistrationOpen ? "-" : pts}
                    </span>
                  </div>
                </Fragment>
              );
            })
          )}
        </div>
          </>
        )}
      </section>
    );
  }

  return (
    <section id="standings-panel" className="border border-[rgba(217,180,255,0.2)] rounded-2xl p-5 bg-[linear-gradient(160deg,rgba(34,19,69,0.6),rgba(15,10,29,0.85))] shadow-[0_4px_20px_rgba(3,2,8,0.3)] animate-[slide-up_400ms_ease-out] max-md:p-4 max-w-full min-w-0">
      <div className={`flex items-center justify-between gap-3 flex-wrap max-md:flex-col max-md:items-stretch ${collapsed ? "mb-0" : "mb-4"}`}>
        <h2 className="m-0 font-['Bebas_Neue',sans-serif] text-[1.5rem] tracking-[0.04em] text-[#f5edff] max-md:text-[1.35rem]">{sectionTitle}</h2>
        <div className="flex items-center gap-[0.6rem] flex-wrap max-md:w-full">
          <span className="inline-flex h-9 items-center text-[0.72rem] font-semibold text-[#c9bddc] bg-[rgba(167,79,255,0.08)] border border-[rgba(217,180,255,0.18)] rounded-md px-3 flex-shrink-0">
            {totalInscritos ?? standings.length} inscritos
          </span>
          <CollapseToggle
            collapsed={collapsed}
            onToggle={() => setCollapsed((value) => !value)}
            label={collapseLabel}
          />
          {!collapsed && standings.length > 5 && (
            <div className="relative flex h-9 items-center max-md:flex-1">
              <input
                className="h-9 pl-3 pr-[1.8rem] border border-[rgba(199,149,255,0.3)] rounded-md bg-[rgba(255,255,255,0.035)] text-[#f5edff] text-[0.78rem] font-['inherit'] outline-none w-44 max-md:w-full transition-[border-color,background,width] duration-[250ms] placeholder:text-[#9f92b5] focus:border-[rgba(199,149,255,0.55)] focus:bg-[rgba(167,79,255,0.09)] focus:w-56 max-md:focus:w-full"
                type="text"
                placeholder="Buscar jogador..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Buscar jogador"
              />
              {search ? (
                <button
                  type="button"
                  className="absolute right-[0.4rem] bg-transparent border-none text-[#beafd7] text-[1rem] leading-none cursor-pointer px-[0.1rem] flex items-center hover:text-[#f5edff]"
                  onClick={() => setSearch("")}
                  aria-label="Limpar busca"
                >
                  x
                </button>
              ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true" className="absolute right-[0.55rem] text-[#beafd7] pointer-events-none flex-shrink-0">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              )}
            </div>
          )}
          {!collapsed && canManageTournament && isFinished && (
            <Tooltip content="Gerar imagem do Top 8" focusable={false}>
              <button
                className="inline-flex items-center gap-[0.35rem] px-[0.85rem] py-[0.32rem] border border-[rgba(255,215,0,0.45)] rounded-full bg-[rgba(255,215,0,0.1)] text-[#fcd34d] text-[0.76rem] font-bold font-['inherit'] cursor-pointer whitespace-nowrap transition-[background,border-color,color] duration-[180ms] tracking-[0.02em] hover:bg-[rgba(255,215,0,0.2)] hover:border-[rgba(255,215,0,0.65)] hover:text-[#ffe168]"
                onClick={() => setShowStory(true)}
                aria-label="Gerar imagem do Top 8"
              >
                Top 8 Story
              </button>
            </Tooltip>
          )}
        </div>
      </div>

      {!collapsed && filtered.length === 0 && (
        <p className="text-[#beafd7] text-[0.9rem] m-0">Nenhum jogador encontrado para "{search}".</p>
      )}

      {!collapsed && filtered.length > 0 && (
        <>
          <div className="rounded-xl border border-[rgba(217,180,255,0.2)] overflow-x-auto max-md:hidden">
            <table className="w-full table-fixed border-collapse text-[0.88rem]">
              <thead className="bg-[#21133a] sticky top-0 z-10 shadow-[0_1px_0_rgba(217,180,255,0.15)]">
                <tr>
                  <th className="w-[3%] text-center px-2 py-[0.65rem] text-[0.75rem] font-bold uppercase tracking-[0.06em] text-[#c795ff]">#</th>
                  <th className="w-[22%] px-2 py-[0.65rem] text-[0.75rem] font-bold uppercase tracking-[0.06em] text-[#c795ff] text-left">Jogador</th>
                  {!isRegistrationOpen && <th className="w-[5%] px-1.5 py-[0.65rem] text-[0.75rem] font-bold uppercase tracking-[0.06em] text-[#c795ff] text-center">Pts</th>}
                  {!isRegistrationOpen && <th className="w-[4%] px-1.5 py-[0.65rem] text-[0.75rem] font-bold uppercase tracking-[0.06em] text-[#c795ff] text-center">V</th>}
                  {!isRegistrationOpen && <th className="w-[4%] px-1.5 py-[0.65rem] text-[0.75rem] font-bold uppercase tracking-[0.06em] text-[#c795ff] text-center">D</th>}
                  {!isRegistrationOpen && <th className="w-[4%] px-1.5 py-[0.65rem] text-[0.75rem] font-bold uppercase tracking-[0.06em] text-[#c795ff] text-center">E</th>}
                  {!isRegistrationOpen && <th className="w-[7%] px-1.5 py-[0.65rem] text-[0.75rem] font-bold uppercase tracking-[0.06em] text-[#c795ff] text-center">MWP</th>}
                  {!isRegistrationOpen && <th className="w-[7%] px-1.5 py-[0.65rem] text-[0.75rem] font-bold uppercase tracking-[0.06em] text-[#c795ff] text-center">OMW%</th>}
                  {!isRegistrationOpen && <th className="w-[7%] px-1.5 py-[0.65rem] text-[0.75rem] font-bold uppercase tracking-[0.06em] text-[#c795ff] text-center">GW%</th>}
                  {!isRegistrationOpen && <th className="w-[7%] px-1.5 py-[0.65rem] text-[0.75rem] font-bold uppercase tracking-[0.06em] text-[#c795ff] text-center">OGW%</th>}
                  <th className={`${isFinished ? "w-[30%]" : "w-[18%]"} px-2 py-[0.65rem] text-[0.75rem] font-bold uppercase tracking-[0.06em] text-[#c795ff] text-left`}>Deck</th>
                  {!isFinished && <th className="w-[12%] px-2 py-[0.65rem] text-[0.75rem] font-bold uppercase tracking-[0.06em] text-[#c795ff] text-left">Check-in</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((player, index) => {
                  const posicao = player.posicao ?? index + 1;
                  const deckId = player.deckId || player.deck?.id;
                  const deckNameOverride = deckId ? deckNameOverrides[deckId] : undefined;
                  const isTop3 = posicao <= 3 && !player.dropped;
                  const isTop8 = posicao <= 8 && !player.dropped;
                  const showCut = hasTop8Cut && posicao === 8 && !player.dropped;
                  const rowBorderClass = isTop3
                    ? posicao === 1 ? "border-l-2 border-l-[rgba(255,215,0,0.5)]" : posicao === 2 ? "border-l-2 border-l-[rgba(192,192,192,0.45)]" : "border-l-2 border-l-[rgba(205,127,50,0.45)]"
                    : isTop8 ? "border-l-2 border-l-[rgba(167,79,255,0.3)]" : "";

                  return (
                    <Fragment key={player.usuario?.id || player.usuarioId || player.id || index}>
                      <tr className={`transition-[background] duration-150 hover:bg-[rgba(167,79,255,0.06)] ${rowBorderClass}`}>
                        <td className="px-2 py-[0.55rem] border-t border-[rgba(255,255,255,0.04)] text-center font-bold text-[#c795ff]">
                          {isTop3 ? (
                            <span className={`inline-flex items-center justify-center w-[1.6rem] h-[1.6rem] rounded-full text-[0.72rem] font-extrabold leading-none ${posicao === 1 ? "bg-[linear-gradient(135deg,#ffd700,#b8860b)] text-[#3d2800] shadow-[0_0_8px_rgba(255,215,0,0.45)]" : posicao === 2 ? "bg-[linear-gradient(135deg,#d0d0d0,#888)] text-[#1e1e1e] shadow-[0_0_6px_rgba(200,200,200,0.3)]" : "bg-[linear-gradient(135deg,#cd7f32,#8b4513)] text-[#fff8f0] shadow-[0_0_6px_rgba(205,127,50,0.35)]"}`}>{posicao}</span>
                          ) : (
                            <span className="text-[#beafd7] text-[0.82rem]">{posicao}</span>
                          )}
                        </td>
                        <td className="px-2 py-[0.55rem] border-t border-[rgba(255,255,255,0.04)] text-[#f5edff] font-semibold min-w-0">
                          <span className="inline-flex items-center gap-[0.35rem] max-w-full min-w-0">
                            {player.time?.imagemUrl && (
                              <Tooltip content={player.time.nome || "Time"} ariaLabel={`Time ${player.time.nome || "do jogador"}`}>
                                <img src={player.time.imagemUrl} alt="" className="w-5 h-5 rounded object-cover flex-shrink-0 opacity-90" />
                              </Tooltip>
                            )}
                            <span className="truncate min-w-0">
                              <PlayerHistoryTooltip player={player} partidas={partidas}>
                                <span>
                                  <UsuarioNomeExibicao
                                    nome={getPlayerName(player)}
                                    excluido={isPlayerExcluido(player)}
                                  />
                                </span>
                              </PlayerHistoryTooltip>
                            </span>
                            {expressiveBadge(player)}
                          </span>
                        </td>
                        {!isRegistrationOpen && (
                          <td className="px-1.5 py-[0.55rem] border-t border-[rgba(255,255,255,0.04)] text-[#f5edff] text-center">
                            <span className={isTop8 && !player.dropped ? "text-[#fde68a] font-bold" : undefined}>
                              {player.pontosMesa ?? player.pontos ?? 0}
                            </span>
                          </td>
                        )}
                        {!isRegistrationOpen && <td className="px-1.5 py-[0.55rem] border-t border-[rgba(255,255,255,0.04)] text-[#86efac] font-semibold text-center">{player.vitoriasPartida ?? player.vitorias ?? 0}</td>}
                        {!isRegistrationOpen && <td className="px-1.5 py-[0.55rem] border-t border-[rgba(255,255,255,0.04)] text-[#fca5a5] text-center">{player.derrotasPartida ?? player.derrotas ?? 0}</td>}
                        {!isRegistrationOpen && <td className="px-1.5 py-[0.55rem] border-t border-[rgba(255,255,255,0.04)] text-[#f5edff] text-center">{player.empatesPartida ?? player.empates ?? 0}</td>}
                        {!isRegistrationOpen && <td className="px-1.5 py-[0.55rem] border-t border-[rgba(255,255,255,0.04)] text-[#beafd7] text-[0.82rem] text-center [font-variant-numeric:tabular-nums]">{formatPct(player.mwp)}</td>}
                        {!isRegistrationOpen && <td className="px-1.5 py-[0.55rem] border-t border-[rgba(255,255,255,0.04)] text-[#beafd7] text-[0.82rem] text-center [font-variant-numeric:tabular-nums]">{formatPct(player.omwp)}</td>}
                        {!isRegistrationOpen && <td className="px-1.5 py-[0.55rem] border-t border-[rgba(255,255,255,0.04)] text-[#beafd7] text-[0.82rem] text-center [font-variant-numeric:tabular-nums]">{formatPct(player.gwp)}</td>}
                        {!isRegistrationOpen && <td className="px-1.5 py-[0.55rem] border-t border-[rgba(255,255,255,0.04)] text-[#beafd7] text-[0.82rem] text-center [font-variant-numeric:tabular-nums]">{formatPct(player.ogwp)}</td>}
                        <td className="px-2 py-[0.55rem] border-t border-[rgba(255,255,255,0.04)] text-[#f5edff] relative min-w-0">
                          {isFinished ? (
                            <DeckViewButton
                              player={player}
                              token={token}
                              isOwner={canManageDeckNames}
                              deckNameOverride={deckNameOverride}
                              onDeckNameUpdate={handleDeckNameUpdate}
                              playerName={getPlayerName(player)}
                              playerRank={posicao}
                            />
                          ) : (
                            <span className={getDeckStatus(player) ? "text-[#4ade80]" : "text-[#beafd7]"}>
                              {getDeckStatus(player) ? "✓" : "-"}
                            </span>
                          )}
                        </td>
                        {!isFinished && (
                          <td className="px-2 py-[0.55rem] border-t border-[rgba(255,255,255,0.04)] text-[#f5edff] min-w-0">
                            {isCheckedIn(player) ? (
                              <span className="inline-flex items-center gap-[0.25rem] text-[#4ade80] font-semibold">
                                ✓
                                <span className="text-[0.7rem] font-bold text-[#86efac] bg-[rgba(34,197,94,0.12)] border border-[rgba(34,197,94,0.3)] rounded-full px-[0.4rem] py-[0.05rem]">
                                  R{(player.checkinRodada ?? -1) + 1}
                                </span>
                              </span>
                            ) : (
                              <span className="text-[#beafd7]">-</span>
                            )}
                          </td>
                        )}
                      </tr>
                      {showCut && (
                        <tr>
                          <td colSpan={colCount} className="px-3 py-[0.2rem] bg-[rgba(167,79,255,0.05)] border-t border-dashed border-t-[rgba(167,79,255,0.35)] border-b border-dashed border-b-[rgba(167,79,255,0.35)]">
                            <span className="block text-center text-[0.7rem] font-bold uppercase tracking-[0.1em] text-[rgba(167,79,255,0.6)]">- Corte para Top 8 -</span>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="hidden max-md:grid gap-[0.55rem] pr-1">
            {filtered.map((player, index) => {
              const posicao = player.posicao ?? index + 1;
              const pontos = player.pontosMesa ?? player.pontos ?? 0;
              const vitorias = player.vitoriasPartida ?? player.vitorias ?? 0;
              const derrotas = player.derrotasPartida ?? player.derrotas ?? 0;
              const empates = player.empatesPartida ?? player.empates ?? 0;
              const deckId = player.deckId || player.deck?.id;
              const deckNameOverride = deckId ? deckNameOverrides[deckId] : undefined;
              const isTop3 = posicao <= 3 && !player.dropped;
              const isTop8 = posicao <= 8 && !player.dropped;
              const showCut = hasTop8Cut && posicao === 8 && !player.dropped;
              const mobileBorderClass = isTop3
                ? posicao === 1 ? "border-[rgba(255,215,0,0.45)] bg-[rgba(255,215,0,0.04)]" : posicao === 2 ? "border-[rgba(192,192,192,0.4)] bg-[rgba(192,192,192,0.03)]" : "border-[rgba(205,127,50,0.4)] bg-[rgba(205,127,50,0.03)]"
                : isTop8 ? "border-[rgba(167,79,255,0.3)] bg-[rgba(255,255,255,0.03)]" : "border-[rgba(217,180,255,0.2)] bg-[rgba(255,255,255,0.03)]";
              const mobileRankColor = isTop3
                ? posicao === 1 ? "text-[#ffd700]" : posicao === 2 ? "text-[#c0c0c0]" : "text-[#cd7f32]"
                : "text-[#c795ff]";

              return (
                <Fragment key={player.usuario?.id || player.usuarioId || player.id || index}>
                  <article className={`border rounded-xl p-[0.7rem] ${mobileBorderClass}`}>
                    <div className="flex items-start justify-between gap-2 mb-[0.45rem]">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {isTop3 && !isRegistrationOpen ? (
                          <span className={`inline-flex items-center justify-center w-[1.6rem] h-[1.6rem] rounded-full text-[0.72rem] font-extrabold leading-none flex-shrink-0 ${RANK_BADGE[posicao]}`}>
                            {posicao}
                          </span>
                        ) : (
                          <span className={`font-bold flex-shrink-0 ${mobileRankColor}`}>#{posicao}</span>
                        )}
                        <span className="inline-flex items-center gap-[0.35rem] font-semibold text-white min-w-0 break-words">
                          {player.time?.imagemUrl && (
                            <Tooltip content={player.time.nome || "Time"} ariaLabel={`Time ${player.time.nome || "do jogador"}`}>
                              <img src={player.time.imagemUrl} alt="" className="w-5 h-5 rounded object-cover flex-shrink-0 opacity-90" />
                            </Tooltip>
                          )}
                          <span className="break-words">
                            <PlayerHistoryTooltip player={player} partidas={partidas}>
                              <span>
                                <UsuarioNomeExibicao
                                  nome={getPlayerName(player)}
                                  excluido={isPlayerExcluido(player)}
                                />
                              </span>
                            </PlayerHistoryTooltip>
                          </span>
                          {expressiveBadge(player)}
                        </span>
                      </div>
                      {!isRegistrationOpen && (
                        <span className={`font-bold text-[0.82rem] flex-shrink-0 ${isTop8 && !player.dropped ? "text-[#fbbf24]" : "text-[#fde68a]"}`}>
                          {pontos} pts
                        </span>
                      )}
                    </div>

                    {isRegistrationOpen ? (
                      <div className="flex items-center gap-3 text-[0.82rem]">
                        <span className={`text-[0.72rem] font-semibold px-2 py-[0.1rem] rounded-full border ${getDeckStatus(player) ? "bg-[rgba(34,197,94,0.12)] border-[rgba(34,197,94,0.3)] text-[#86efac]" : "bg-[rgba(239,68,68,0.12)] border-[rgba(239,68,68,0.3)] text-[#fca5a5]"}`}>
                          {getDeckStatus(player) ? "✓ Deck" : "Sem deck"}
                        </span>
                        <span className={`text-[0.72rem] font-semibold px-2 py-[0.1rem] rounded-full border ${isCheckedIn(player) ? "bg-[rgba(34,197,94,0.12)] border-[rgba(34,197,94,0.3)] text-[#86efac]" : "bg-[rgba(239,68,68,0.12)] border-[rgba(239,68,68,0.3)] text-[#fca5a5]"}`}>
                          {isCheckedIn(player) ? `✓ Check-in R${(player.checkinRodada ?? -1) + 1}` : "Sem check-in"}
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-[0.35rem] mb-[0.4rem] text-[0.82rem]">
                          <span className="font-semibold text-[#86efac]">{vitorias}V</span>
                          <span className="text-[#beafd7] font-normal">-</span>
                          <span className="font-semibold text-[#fca5a5]">{derrotas}D</span>
                          <span className="text-[#beafd7] font-normal">-</span>
                          <span className="font-semibold text-[#f5edff]">{empates}E</span>
                          {!isFinished && (
                            <span className={`ml-auto text-[0.72rem] font-semibold px-2 py-[0.1rem] rounded-full border ${isCheckedIn(player) ? "bg-[rgba(34,197,94,0.12)] border-[rgba(34,197,94,0.3)] text-[#86efac]" : "bg-[rgba(239,68,68,0.12)] border-[rgba(239,68,68,0.3)] text-[#fca5a5]"}`}>
                              {isCheckedIn(player) ? `✓ Check-in R${(player.checkinRodada ?? -1) + 1}` : "Sem check-in"}
                            </span>
                          )}
                        </div>

                        <div className="flex gap-3 flex-wrap text-[0.77rem] text-[#beafd7] [font-variant-numeric:tabular-nums]">
                          <span><span className="text-[0.68rem] font-bold uppercase tracking-[0.04em] text-[rgba(199,149,255,0.6)] mr-[0.15rem]">MWP</span> {formatPct(player.mwp)}</span>
                          <span><span className="text-[0.68rem] font-bold uppercase tracking-[0.04em] text-[rgba(199,149,255,0.6)] mr-[0.15rem]">OMW%</span> {formatPct(player.omwp)}</span>
                          <span><span className="text-[0.68rem] font-bold uppercase tracking-[0.04em] text-[rgba(199,149,255,0.6)] mr-[0.15rem]">GW%</span> {formatPct(player.gwp)}</span>
                          <span><span className="text-[0.68rem] font-bold uppercase tracking-[0.04em] text-[rgba(199,149,255,0.6)] mr-[0.15rem]">OGW%</span> {formatPct(player.ogwp)}</span>
                        </div>
                      </>
                    )}

                    {isFinished && (
                      <div className="mt-2 pt-2 border-t border-[rgba(217,180,255,0.2)]">
                        <DeckViewButton
                          player={player}
                          token={token}
                          isOwner={canManageDeckNames}
                          deckNameOverride={deckNameOverride}
                          onDeckNameUpdate={handleDeckNameUpdate}
                          playerName={getPlayerName(player)}
                          playerRank={posicao}
                        />
                      </div>
                    )}
                  </article>
                  {showCut && (
                    <div className="flex items-center justify-center py-[0.3rem]">
                      <span className="block text-center text-[0.68rem] font-bold uppercase tracking-[0.1em] text-[rgba(167,79,255,0.6)]">- Corte para Top 8 -</span>
                    </div>
                  )}
                </Fragment>
              );
            })}
          </div>
        </>
      )}

      {showStory && (
        <Top8StoryModal
          standings={enrichedStandings}
          torneioNome={torneioNome}
          torneioHorario={torneioHorario}
          storyFundoUrl={storyFundoUrl}
          storyFundoTextoRodape={storyFundoTextoRodape}
          deckNameOverrides={deckNameOverrides}
          onClose={() => setShowStory(false)}
        />
      )}
    </section>
  );
}
