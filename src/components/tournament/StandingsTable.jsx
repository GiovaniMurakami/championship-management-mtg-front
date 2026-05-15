import { Fragment, useState } from "react";
import { Top8StoryModal } from "./Top8StoryModal";
import { DeckViewButton, RANK_BADGE } from "./DeckDrawer";

export function StandingsTable({
  standings,
  isFinished = false,
  isRegistrationOpen = false,
  token,
  isOwner = false,
  isAdmin = false,
  torneioNome = "",
  compact = false,
}) {
  const [deckNameOverrides, setDeckNameOverrides] = useState({});
  const [showStory, setShowStory] = useState(false);
  const [search, setSearch] = useState("");

  if (!standings || standings.length === 0) {
    return (
      <section className="border border-[rgba(217,180,255,0.2)] rounded-2xl p-5 bg-[linear-gradient(160deg,rgba(34,19,69,0.6),rgba(15,10,29,0.85))] shadow-[0_4px_20px_rgba(3,2,8,0.3)] animate-[slide-up_400ms_ease-out]">
        <h2 className="m-0 mb-4 font-['Bebas_Neue',sans-serif] text-[1.5rem] tracking-[0.04em] text-[#f5edff]">Standings</h2>
        <p className="text-[#beafd7] text-[0.9rem] m-0">Nenhum dado de standings disponivel.</p>
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

  const getDeckStatus = (player) =>
    player?.deckId || player?.deck?.id || player?.deckConfirmado;

  const isCheckedIn = (player) =>
    (player?.checkinRodada ?? -1) >= 0;

  const formatPct = (val) => (val != null ? `${(val * 100).toFixed(1)}%` : "-");

  const handleDeckNameUpdate = (deckId, newName) => {
    setDeckNameOverrides((prev) => ({ ...prev, [deckId]: newName }));
  };

  const canManageDeckNames = isOwner || isAdmin;

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
          <h2 className="m-0 font-['Bebas_Neue',sans-serif] text-[1.4rem] tracking-[0.04em] text-[#f5edff]">Standings</h2>
          <span className="text-[0.72rem] font-semibold text-[#beafd7] bg-[rgba(167,79,255,0.12)] border border-[rgba(217,180,255,0.2)] rounded-full px-[0.55rem] py-[0.15rem] flex-shrink-0">
            {standings.length} jogadores
          </span>
        </div>

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

        <div className="overflow-y-auto flex-1 min-h-0 max-h-[calc(100vh-320px)] [scrollbar-width:thin] [scrollbar-color:rgba(167,79,255,0.3)_transparent] pb-2">
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
                        <img
                          src={player.time.imagemUrl}
                          alt={player.time.nome}
                          className="w-5 h-5 rounded object-cover flex-shrink-0 opacity-90"
                        />
                      )}
                      <span className="truncate">{getPlayerName(player)}</span>
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
      </section>
    );
  }

  return (
    <section className="border border-[rgba(217,180,255,0.2)] rounded-2xl p-5 bg-[linear-gradient(160deg,rgba(34,19,69,0.6),rgba(15,10,29,0.85))] shadow-[0_4px_20px_rgba(3,2,8,0.3)] animate-[slide-up_400ms_ease-out]">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <h2 className="m-0 font-['Bebas_Neue',sans-serif] text-[1.5rem] tracking-[0.04em] text-[#f5edff]">{isRegistrationOpen ? "Jogadores Inscritos" : "Standings"}</h2>
        <div className="flex items-center gap-[0.6rem] flex-wrap">
          {standings.length > 5 && (
            <div className="relative flex items-center">
              <input
                className="pl-3 pr-[1.8rem] py-[0.28rem] border border-[rgba(199,149,255,0.3)] rounded-full bg-[rgba(167,79,255,0.08)] text-[#f5edff] text-[0.78rem] font-['inherit'] outline-none w-40 transition-[border-color,background,width] duration-[250ms] placeholder:text-[#beafd7] focus:border-[rgba(199,149,255,0.55)] focus:bg-[rgba(167,79,255,0.13)] focus:w-52"
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
          {isOwner && isFinished && (
            <button
              className="inline-flex items-center gap-[0.35rem] px-[0.85rem] py-[0.32rem] border border-[rgba(255,215,0,0.45)] rounded-full bg-[rgba(255,215,0,0.1)] text-[#fcd34d] text-[0.76rem] font-bold font-['inherit'] cursor-pointer whitespace-nowrap transition-[background,border-color,color] duration-[180ms] tracking-[0.02em] hover:bg-[rgba(255,215,0,0.2)] hover:border-[rgba(255,215,0,0.65)] hover:text-[#ffe168]"
              onClick={() => setShowStory(true)}
              title="Gerar imagem do Top 8"
            >
              Top 8 Story
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 && (
        <p className="text-[#beafd7] text-[0.9rem] m-0">Nenhum jogador encontrado para "{search}".</p>
      )}

      {filtered.length > 0 && (
        <>
          <div className="rounded-xl border border-[rgba(217,180,255,0.2)] overflow-auto max-h-[62vh] [scrollbar-width:thin] [scrollbar-color:rgba(167,79,255,0.3)_transparent] hidden max-[480px]:hidden [&]:block max-[480px]:[&]:hidden">
            <table className="w-full border-collapse text-[0.88rem]">
              <thead className="bg-[rgba(142,57,237,0.12)] sticky top-0 z-10 shadow-[0_1px_0_rgba(217,180,255,0.15)]">
                <tr>
                  <th className="w-10 text-center px-3 py-[0.65rem] text-[0.75rem] font-bold uppercase tracking-[0.06em] text-[#c795ff] text-left whitespace-nowrap">#</th>
                  <th className="px-3 py-[0.65rem] text-[0.75rem] font-bold uppercase tracking-[0.06em] text-[#c795ff] text-left whitespace-nowrap">Jogador</th>
                  {!isRegistrationOpen && <th className="px-3 py-[0.65rem] text-[0.75rem] font-bold uppercase tracking-[0.06em] text-[#c795ff] text-left whitespace-nowrap">Pts</th>}
                  {!isRegistrationOpen && <th className="px-3 py-[0.65rem] text-[0.75rem] font-bold uppercase tracking-[0.06em] text-[#c795ff] text-left whitespace-nowrap">V</th>}
                  {!isRegistrationOpen && <th className="px-3 py-[0.65rem] text-[0.75rem] font-bold uppercase tracking-[0.06em] text-[#c795ff] text-left whitespace-nowrap">D</th>}
                  {!isRegistrationOpen && <th className="px-3 py-[0.65rem] text-[0.75rem] font-bold uppercase tracking-[0.06em] text-[#c795ff] text-left whitespace-nowrap">E</th>}
                  {!isRegistrationOpen && <th className="px-3 py-[0.65rem] text-[0.75rem] font-bold uppercase tracking-[0.06em] text-[#c795ff] text-left whitespace-nowrap">MWP</th>}
                  {!isRegistrationOpen && <th className="px-3 py-[0.65rem] text-[0.75rem] font-bold uppercase tracking-[0.06em] text-[#c795ff] text-left whitespace-nowrap">OMW%</th>}
                  {!isRegistrationOpen && <th className="px-3 py-[0.65rem] text-[0.75rem] font-bold uppercase tracking-[0.06em] text-[#c795ff] text-left whitespace-nowrap">GW%</th>}
                  {!isRegistrationOpen && <th className="px-3 py-[0.65rem] text-[0.75rem] font-bold uppercase tracking-[0.06em] text-[#c795ff] text-left whitespace-nowrap">OGW%</th>}
                  <th className="px-3 py-[0.65rem] text-[0.75rem] font-bold uppercase tracking-[0.06em] text-[#c795ff] text-left whitespace-nowrap">Deck</th>
                  {!isFinished && <th className="px-3 py-[0.65rem] text-[0.75rem] font-bold uppercase tracking-[0.06em] text-[#c795ff] text-left whitespace-nowrap">Check-in</th>}
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
                        <td className="px-3 py-[0.55rem] border-t border-[rgba(255,255,255,0.04)] text-[#f5edff] text-center font-bold text-[#c795ff]">
                          {isTop3 ? (
                            <span className={`inline-flex items-center justify-center w-[1.6rem] h-[1.6rem] rounded-full text-[0.72rem] font-extrabold leading-none ${posicao === 1 ? "bg-[linear-gradient(135deg,#ffd700,#b8860b)] text-[#3d2800] shadow-[0_0_8px_rgba(255,215,0,0.45)]" : posicao === 2 ? "bg-[linear-gradient(135deg,#d0d0d0,#888)] text-[#1e1e1e] shadow-[0_0_6px_rgba(200,200,200,0.3)]" : "bg-[linear-gradient(135deg,#cd7f32,#8b4513)] text-[#fff8f0] shadow-[0_0_6px_rgba(205,127,50,0.35)]"}`}>{posicao}</span>
                          ) : (
                            <span className="text-[#beafd7] text-[0.82rem]">{posicao}</span>
                          )}
                        </td>
                        <td className="px-3 py-[0.55rem] border-t border-[rgba(255,255,255,0.04)] text-[#f5edff] font-semibold">
                          <span className="inline-flex items-center gap-[0.35rem]">
                            {player.time?.imagemUrl && (
                              <img
                                src={player.time.imagemUrl}
                                alt={player.time.nome}
                                className="w-5 h-5 rounded object-cover flex-shrink-0 opacity-90"
                              />
                            )}
                            <span>{getPlayerName(player)}</span>
                          </span>
                        </td>
                        {!isRegistrationOpen && (
                          <td className="px-3 py-[0.55rem] border-t border-[rgba(255,255,255,0.04)] text-[#f5edff]">
                            <span className={isTop8 && !player.dropped ? "text-[#fde68a] font-bold" : undefined}>
                              {player.pontosMesa ?? player.pontos ?? 0}
                            </span>
                          </td>
                        )}
                        {!isRegistrationOpen && <td className="px-3 py-[0.55rem] border-t border-[rgba(255,255,255,0.04)] text-[#86efac] font-semibold">{player.vitoriasPartida ?? player.vitorias ?? 0}</td>}
                        {!isRegistrationOpen && <td className="px-3 py-[0.55rem] border-t border-[rgba(255,255,255,0.04)] text-[#fca5a5]">{player.derrotasPartida ?? player.derrotas ?? 0}</td>}
                        {!isRegistrationOpen && <td className="px-3 py-[0.55rem] border-t border-[rgba(255,255,255,0.04)] text-[#f5edff]">{player.empatesPartida ?? player.empates ?? 0}</td>}
                        {!isRegistrationOpen && <td className="px-3 py-[0.55rem] border-t border-[rgba(255,255,255,0.04)] text-[#beafd7] text-[0.82rem] [font-variant-numeric:tabular-nums]">{formatPct(player.mwp)}</td>}
                        {!isRegistrationOpen && <td className="px-3 py-[0.55rem] border-t border-[rgba(255,255,255,0.04)] text-[#beafd7] text-[0.82rem] [font-variant-numeric:tabular-nums]">{formatPct(player.omwp)}</td>}
                        {!isRegistrationOpen && <td className="px-3 py-[0.55rem] border-t border-[rgba(255,255,255,0.04)] text-[#beafd7] text-[0.82rem] [font-variant-numeric:tabular-nums]">{formatPct(player.gwp)}</td>}
                        {!isRegistrationOpen && <td className="px-3 py-[0.55rem] border-t border-[rgba(255,255,255,0.04)] text-[#beafd7] text-[0.82rem] [font-variant-numeric:tabular-nums]">{formatPct(player.ogwp)}</td>}
                        <td className="px-3 py-[0.55rem] border-t border-[rgba(255,255,255,0.04)] text-[#f5edff] relative">
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
                              {getDeckStatus(player) ? "âœ“" : "-"}
                            </span>
                          )}
                        </td>
                        {!isFinished && (
                          <td className="px-3 py-[0.55rem] border-t border-[rgba(255,255,255,0.04)] text-[#f5edff]">
                            {isCheckedIn(player) ? (
                              <span className="inline-flex items-center gap-[0.25rem] text-[#4ade80] font-semibold">
                                âœ“
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

          <div className="hidden max-[480px]:grid gap-[0.55rem]">
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
                    <div className="flex items-center justify-between gap-2 mb-[0.45rem]">
                      {isTop3 && !isRegistrationOpen ? (
                        <span className={`inline-flex items-center justify-center w-[1.6rem] h-[1.6rem] rounded-full text-[0.72rem] font-extrabold leading-none flex-shrink-0 ${RANK_BADGE[posicao]}`}>
                          {posicao}
                        </span>
                      ) : (
                        <span className={`font-bold flex-shrink-0 ${mobileRankColor}`}>#{posicao}</span>
                      )}
                      <span className="inline-flex items-center gap-[0.35rem] font-semibold text-white break-words flex-wrap">
                        {player.time?.imagemUrl && (
                          <img
                            src={player.time.imagemUrl}
                            alt={player.time.nome}
                            className="w-5 h-5 rounded object-cover flex-shrink-0 opacity-90"
                          />
                        )}
                        <span>{getPlayerName(player)}</span>
                      </span>
                      {!isRegistrationOpen && (
                        <span className={`font-bold text-[0.82rem] ${isTop8 && !player.dropped ? "text-[#fbbf24]" : "text-[#fde68a]"}`}>
                          {pontos} pts
                        </span>
                      )}
                    </div>

                    {isRegistrationOpen ? (
                      <div className="flex items-center gap-3 text-[0.82rem]">
                        <span className={`text-[0.72rem] font-semibold px-2 py-[0.1rem] rounded-full border ${getDeckStatus(player) ? "bg-[rgba(34,197,94,0.12)] border-[rgba(34,197,94,0.3)] text-[#86efac]" : "bg-[rgba(239,68,68,0.12)] border-[rgba(239,68,68,0.3)] text-[#fca5a5]"}`}>
                          {getDeckStatus(player) ? "âœ“ Deck" : "Sem deck"}
                        </span>
                        <span className={`text-[0.72rem] font-semibold px-2 py-[0.1rem] rounded-full border ${isCheckedIn(player) ? "bg-[rgba(34,197,94,0.12)] border-[rgba(34,197,94,0.3)] text-[#86efac]" : "bg-[rgba(239,68,68,0.12)] border-[rgba(239,68,68,0.3)] text-[#fca5a5]"}`}>
                          {isCheckedIn(player) ? `âœ“ Check-in R${(player.checkinRodada ?? -1) + 1}` : "Sem check-in"}
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
                              {isCheckedIn(player) ? `âœ“ Check-in R${(player.checkinRodada ?? -1) + 1}` : "Sem check-in"}
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
          deckNameOverrides={deckNameOverrides}
          onClose={() => setShowStory(false)}
        />
      )}
    </section>
  );
}
