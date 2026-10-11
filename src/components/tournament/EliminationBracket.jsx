import { useMemo, useState } from "react";
import { ImageDown } from "lucide-react";
import { getMatchPlayerName, isMatchPlayerExcluido } from "../../utils/matchDisplay";
import { getFirstEliminationRound } from "../../utils/tournamentFlow";
import { UsuarioNomeExibicao } from "../ui/UsuarioExcluidoTag";
import { Tooltip } from "../ui/Tooltip";
import { Top8StoryModal } from "./Top8StoryModal";

const COLUMN_WIDTH = 250;
const MATCH_BLOCK = 118; // altura aproximada do card + folga interna do slot

function standingPlayerId(player) {
  return player?.usuario?.id || player?.usuarioId || player?.userId || player?.id;
}

/** Monta a lista do Top N na ordem do chaveamento (1ª rodada do corte). */
export function buildEliminationTopPlayers(partidas, firstCutRound, standings = []) {
  if (!firstCutRound) return [];
  const byId = new Map(
    (standings || [])
      .map((player) => [standingPlayerId(player), player])
      .filter(([id]) => Boolean(id)),
  );
  const firstRound = (partidas || [])
    .filter((partida) => Number(partida?.rodada) === Number(firstCutRound))
    .sort((a, b) => Number(a?.mesa ?? 0) - Number(b?.mesa ?? 0));

  const players = [];
  const seen = new Set();
  for (const partida of firstRound) {
    for (const side of [1, 2]) {
      const id = side === 1
        ? (partida.jogador1Id || partida.jogador1?.id)
        : (partida.jogador2Id || partida.jogador2?.id);
      if (!id || seen.has(id)) continue;
      seen.add(id);
      const standing = byId.get(id);
      if (standing) {
        players.push(standing);
        continue;
      }
      players.push({
        usuarioId: id,
        usuario: {
          id,
          nome: getMatchPlayerName(partida, side),
          excluido: isMatchPlayerExcluido(partida, side),
        },
        nome: getMatchPlayerName(partida, side),
        deckNome: "—",
      });
    }
  }
  return players;
}

function getRoundLabel(participants) {
  if (participants >= 16) return "Oitavas";
  if (participants === 8) return "Quartas";
  if (participants === 4) return "Semifinal";
  if (participants === 2) return "Final";
  return "Corte";
}

function getWinnerId(partida) {
  if (!partida || partida.status !== "finalizada") return null;
  if (!partida.jogador2Id && !partida.jogador2) return partida.jogador1Id || partida.jogador1?.id;
  const v1 = Number(partida.vitoriasJogador1 ?? 0);
  const v2 = Number(partida.vitoriasJogador2 ?? 0);
  if (v1 > v2) return partida.jogador1Id || partida.jogador1?.id;
  if (v2 > v1) return partida.jogador2Id || partida.jogador2?.id;
  return null;
}

function BracketPlayer({ name, usuarioId, score, isWinner, isBye, excluido = false }) {
  return (
    <div className={`flex min-w-0 items-center justify-between gap-2 rounded-md border px-2.5 py-1.5 ${
      isWinner
        ? "border-[rgba(250,204,21,0.48)] bg-[rgba(250,204,21,0.12)] text-[#fef3c7]"
        : "border-line-soft bg-[rgba(255,255,255,0.04)] text-[#d8cfee]"
    } ${isBye ? "opacity-55" : ""}`}>
      <span className="min-w-0 flex-1 truncate text-sm font-semibold">
        {isBye
          ? name
          : (
            <UsuarioNomeExibicao
              nome={name}
              usuarioId={usuarioId}
              excluido={excluido}
              className="block min-w-0 truncate"
              nameClassName="block min-w-0 truncate"
            />
          )}
      </span>
      <span className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-black ${isWinner ? "bg-[rgba(250,204,21,0.2)] text-[#fde68a]" : "bg-[rgba(217,180,255,0.08)] text-text-soft"}`}>
        {score}
      </span>
    </div>
  );
}

function BracketMatch({ partida, matchIndex }) {
  const isBye = !partida.jogador2Id && !partida.jogador2;
  const winnerId = getWinnerId(partida);
  const jogador1Id = partida.jogador1Id || partida.jogador1?.id;
  const jogador2Id = partida.jogador2Id || partida.jogador2?.id;
  const score1 = partida.status === "finalizada" ? Number(partida.vitoriasJogador1 ?? 0) : "-";
  const score2 = partida.status === "finalizada" ? Number(partida.vitoriasJogador2 ?? 0) : "-";

  return (
    <article className="w-full min-w-0 max-w-full overflow-hidden rounded-lg border border-line-soft bg-[#0b0717] p-2.5 shadow-[0_10px_28px_rgba(0,0,0,0.22)]">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-[0.68rem] font-bold uppercase tracking-[0.08em] text-brand">
          Jogo {matchIndex + 1}
        </span>
        <span className={`rounded-full px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.06em] ${
          partida.status === "finalizada"
            ? "border border-[rgba(34,197,94,0.35)] bg-[rgba(34,197,94,0.12)] text-[#86efac]"
            : "border border-[rgba(250,204,21,0.32)] bg-[rgba(250,204,21,0.1)] text-[#fde68a]"
        }`}>
          {partida.status === "finalizada" ? "Finalizada" : "Pendente"}
        </span>
      </div>
      <div className="grid min-w-0 gap-1.5">
        <BracketPlayer
          name={getMatchPlayerName(partida, 1)}
          usuarioId={jogador1Id}
          score={score1}
          isWinner={winnerId === jogador1Id}
          excluido={isMatchPlayerExcluido(partida, 1)}
        />
        <BracketPlayer
          name={isBye ? "BYE" : getMatchPlayerName(partida, 2)}
          usuarioId={jogador2Id}
          score={score2}
          isWinner={winnerId === jogador2Id}
          isBye={isBye}
          excluido={!isBye && isMatchPlayerExcluido(partida, 2)}
        />
      </div>
    </article>
  );
}

export function EliminationBracket({
  torneio,
  partidas,
  standings = [],
  canManageTournament = false,
}) {
  const [showStory, setShowStory] = useState(false);
  const corteTop = Number(torneio?.corteTop || 0);
  const firstCutRound = getFirstEliminationRound(torneio);

  const cutMatches = useMemo(() => {
    if (!corteTop || !firstCutRound) return [];
    return (partidas || [])
      .filter((partida) => Number(partida?.rodada) >= firstCutRound)
      .sort((a, b) => Number(a?.rodada ?? 0) - Number(b?.rodada ?? 0) || Number(a?.mesa ?? 0) - Number(b?.mesa ?? 0));
  }, [corteTop, firstCutRound, partidas]);

  const topPlayers = useMemo(
    () => buildEliminationTopPlayers(partidas, firstCutRound, standings),
    [partidas, firstCutRound, standings],
  );

  if (!corteTop || !firstCutRound || cutMatches.length === 0) return null;

  const rounds = Array.from(
    cutMatches.reduce((map, partida) => {
      const rodada = Number(partida.rodada);
      if (!map.has(rodada)) map.set(rodada, []);
      map.get(rodada).push(partida);
      return map;
    }, new Map())
  ).sort(([a], [b]) => a - b);

  const finalMatch = cutMatches
    .filter((partida) => Number(partida.rodada) === Number(torneio?.totalRodadas))
    .find((partida) => partida.status === "finalizada");
  const championId = getWinnerId(finalMatch);
  const championName = championId && finalMatch
    ? championId === (finalMatch.jogador1Id || finalMatch.jogador1?.id)
      ? getMatchPlayerName(finalMatch, 1)
      : getMatchPlayerName(finalMatch, 2)
    : null;

  const baseSlots = Math.max(1, rounds[0]?.[1]?.length || Math.ceil(corteTop / 2));
  const canExportStory = canManageTournament && topPlayers.length >= 2;

  return (
    <section className="overflow-hidden rounded-2xl border border-[rgba(250,204,21,0.22)] bg-[linear-gradient(160deg,rgba(42,29,10,0.78),rgba(14,10,25,0.92))] p-5 shadow-[0_4px_20px_rgba(3,2,8,0.34)] max-md:p-4 max-w-full min-w-0">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3 max-md:flex-col max-md:items-stretch">
        <div>
          <p className="m-0 text-xs font-black uppercase tracking-[0.12em] text-[#facc15]">Corte Top {corteTop}</p>
          <h2 className="m-0 mt-1 font-['Bebas_Neue',sans-serif] text-[1.7rem] tracking-[0.05em] text-text-main max-md:text-[1.45rem]">
            Chaveamento eliminatório
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2 max-md:w-full max-md:justify-between">
          {canExportStory && (
            <Tooltip content={`Gerar imagem do Top ${corteTop} eliminatório`} focusable={false}>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(255,215,0,0.45)] bg-[rgba(255,215,0,0.1)] px-3 py-1.5 font-['inherit'] text-[0.76rem] font-bold tracking-[0.02em] text-[#fcd34d] transition-[background,border-color,color] duration-150 hover:border-[rgba(255,215,0,0.65)] hover:bg-[rgba(255,215,0,0.2)] hover:text-[#ffe168]"
                onClick={() => setShowStory(true)}
                aria-label={`Exportar imagem do Top ${corteTop}`}
              >
                <ImageDown size={14} aria-hidden="true" />
                Exportar Top {corteTop}
              </button>
            </Tooltip>
          )}
          <div className="rounded-lg border border-[rgba(250,204,21,0.28)] bg-[rgba(250,204,21,0.1)] px-3 py-2 text-right max-md:text-left">
            <span className="block text-[0.65rem] font-bold uppercase tracking-[0.08em] text-[#fde68a]">Campeao</span>
            <strong className="block max-w-[220px] truncate text-sm text-[#fff7cc] max-md:max-w-none">
              {championName ? <UsuarioNomeExibicao nome={championName} usuarioId={championId} /> : "A definir"}
            </strong>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto pb-2 [scrollbar-width:thin] [scrollbar-color:rgba(250,204,21,0.28)_transparent]">
        <div
          className="flex w-max items-stretch"
          style={{ gap: 28, minWidth: "100%" }}
        >
          {rounds.map(([rodada, matches], roundIndex) => {
            const participants = corteTop / (2 ** roundIndex);
            const slotSpan = 2 ** roundIndex;
            const slotHeight = MATCH_BLOCK * slotSpan;

            return (
              <div
                key={rodada}
                className="flex shrink-0 flex-col"
                style={{ width: COLUMN_WIDTH, minWidth: COLUMN_WIDTH, maxWidth: COLUMN_WIDTH }}
              >
                <div className="mb-3 flex shrink-0 items-center justify-between gap-2">
                  <h3 className="m-0 text-sm font-black uppercase tracking-[0.08em] text-[#fde68a]">
                    {getRoundLabel(participants)}
                  </h3>
                  <span className="rounded-full border border-[rgba(250,204,21,0.24)] px-2 py-0.5 text-[0.68rem] font-bold text-[#d8cfee]">
                    R{rodada}
                  </span>
                </div>
                <div
                  className="flex min-w-0 flex-col"
                  style={{ minHeight: MATCH_BLOCK * baseSlots }}
                >
                  {matches.map((partida, index) => (
                    <div
                      key={partida.id || `${rodada}-${index}`}
                      className="flex min-w-0 items-center"
                      style={{ height: slotHeight }}
                    >
                      <BracketMatch partida={partida} matchIndex={index} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showStory && (
        <Top8StoryModal
          standings={topPlayers}
          torneioNome={torneio?.nome || ""}
          torneioHorario={torneio?.horario || ""}
          storyFundoUrl={torneio?.storyFundoUrl || torneio?.storyFundo?.url || ""}
          storyFundoTextoRodape={torneio?.storyFundoTextoRodape || torneio?.storyFundo?.textoRodape || "escuro"}
          initialTopN={corteTop}
          onClose={() => setShowStory(false)}
        />
      )}
    </section>
  );
}
