import { useMemo, useState } from "react";
import { ImageDown } from "lucide-react";
import { getMatchPlayerName, isMatchPlayerExcluido } from "../../utils/matchDisplay";
import { getFirstEliminationRound } from "../../utils/tournamentFlow";
import { UsuarioNomeExibicao } from "../ui/UsuarioExcluidoTag";
import { Tooltip } from "../ui/Tooltip";
import { Top8StoryModal } from "./Top8StoryModal";

const COLUMN_WIDTH = 250;
/** Altura de 1 slot na 1ª rodada (= card + folga). Rodadas seguintes usam múltiplos. */
const MATCH_BLOCK = 152;

function standingPlayerId(player) {
  return player?.usuario?.id || player?.usuarioId || player?.userId || player?.id;
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

function fallbackPlayer(partida, side, id) {
  return {
    usuarioId: id,
    usuario: {
      id,
      nome: getMatchPlayerName(partida, side),
      excluido: isMatchPlayerExcluido(partida, side),
    },
    nome: getMatchPlayerName(partida, side),
    deckNome: "—",
  };
}

/**
 * Monta o Top N do mata-mata na ordem de colocação:
 * campeão → finalista → eliminados nas semis → quartas → …
 * Empates na mesma rodada usam a posição Swiss como desempate.
 */
export function buildEliminationTopPlayers(
  partidas,
  firstCutRound,
  standings = [],
  { totalRodadas } = {},
) {
  if (!firstCutRound) return [];
  const byId = new Map(
    (standings || [])
      .map((player) => [standingPlayerId(player), player])
      .filter(([id]) => Boolean(id)),
  );
  const firstRound = (partidas || [])
    .filter((partida) => Number(partida?.rodada) === Number(firstCutRound))
    .sort((a, b) => Number(a?.mesa ?? 0) - Number(b?.mesa ?? 0));

  const meta = new Map();
  for (const partida of firstRound) {
    for (const side of [1, 2]) {
      const id = side === 1
        ? (partida.jogador1Id || partida.jogador1?.id)
        : (partida.jogador2Id || partida.jogador2?.id);
      if (!id || meta.has(id)) continue;
      const standing = byId.get(id);
      meta.set(id, {
        player: standing || fallbackPlayer(partida, side, id),
        wonFinal: false,
        eliminatedRound: null,
        maxRound: Number(firstCutRound),
        mesa: Number(partida.mesa ?? 0),
        swissPos: Number(standing?.posicao ?? 9999),
      });
    }
  }

  if (meta.size === 0) return [];

  const cutMatches = (partidas || [])
    .filter((partida) => Number(partida?.rodada) >= Number(firstCutRound))
    .sort(
      (a, b) =>
        Number(a?.rodada ?? 0) - Number(b?.rodada ?? 0)
        || Number(a?.mesa ?? 0) - Number(b?.mesa ?? 0),
    );

  const finalRound = Number(totalRodadas || 0)
    || Math.max(...cutMatches.map((p) => Number(p.rodada || 0)), Number(firstCutRound));

  for (const partida of cutMatches) {
    const rodada = Number(partida.rodada || 0);
    const winnerId = getWinnerId(partida);
    for (const side of [1, 2]) {
      const id = side === 1
        ? (partida.jogador1Id || partida.jogador1?.id)
        : (partida.jogador2Id || partida.jogador2?.id);
      if (!id) continue;
      let entry = meta.get(id);
      if (!entry) {
        const standing = byId.get(id);
        entry = {
          player: standing || fallbackPlayer(partida, side, id),
          wonFinal: false,
          eliminatedRound: null,
          maxRound: rodada,
          mesa: Number(partida.mesa ?? 0),
          swissPos: Number(standing?.posicao ?? 9999),
        };
        meta.set(id, entry);
      }
      entry.maxRound = Math.max(entry.maxRound, rodada);
      entry.mesa = Number(partida.mesa ?? entry.mesa ?? 0);
      if (partida.status === "finalizada" && winnerId && id !== winnerId) {
        entry.eliminatedRound = rodada;
      }
      if (partida.status === "finalizada" && winnerId === id && rodada === finalRound) {
        entry.wonFinal = true;
      }
    }
  }

  const ranked = [...meta.values()].sort((a, b) => {
    if (a.wonFinal !== b.wonFinal) return a.wonFinal ? -1 : 1;

    const aAlive = a.eliminatedRound == null;
    const bAlive = b.eliminatedRound == null;
    if (aAlive !== bAlive) return aAlive ? -1 : 1;

    if (!aAlive && !bAlive && a.eliminatedRound !== b.eliminatedRound) {
      return b.eliminatedRound - a.eliminatedRound; // perdeu mais tarde = melhor
    }

    if (aAlive && bAlive && a.maxRound !== b.maxRound) {
      return b.maxRound - a.maxRound;
    }

    if (a.swissPos !== b.swissPos) return a.swissPos - b.swissPos;
    return a.mesa - b.mesa;
  });

  return ranked.map((entry, index) => ({
    ...entry.player,
    posicao: index + 1,
  }));
}

function getRoundLabel(participants) {
  if (participants >= 16) return "Oitavas";
  if (participants === 8) return "Quartas";
  if (participants === 4) return "Semifinal";
  if (participants === 2) return "Final";
  return "Corte";
}

function BracketPlayer({ name, usuarioId, score, isWinner, isBye, excluido = false }) {
  return (
    <div className={`flex min-w-0 items-center justify-between gap-2 rounded-md border px-2 py-1 ${
      isWinner
        ? "border-[rgba(250,204,21,0.4)] bg-[rgba(250,204,21,0.1)] text-[#fef3c7]"
        : "border-line bg-[rgba(255,255,255,0.03)] text-text-main"
    } ${isBye ? "opacity-55" : ""}`}>
      <span className="min-w-0 flex-1 truncate text-[0.8rem] font-semibold leading-tight">
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
      <span className={`shrink-0 rounded px-1.5 py-0.5 text-[0.7rem] font-bold tabular-nums leading-none ${isWinner ? "bg-[rgba(250,204,21,0.18)] text-[#fde68a]" : "bg-[rgba(167,79,255,0.1)] text-text-soft"}`}>
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
    <article className="w-full min-w-0 max-w-full shrink-0 overflow-hidden rounded-xl border border-line bg-[rgba(8,5,18,0.72)] p-2 shadow-[0_8px_22px_rgba(0,0,0,0.2)]">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-[0.65rem] font-bold uppercase tracking-[0.08em] text-brand">
          Jogo {matchIndex + 1}
        </span>
        <span className={`rounded-full px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-[0.06em] ${
          partida.status === "finalizada"
            ? "border border-[rgba(34,197,94,0.35)] bg-[rgba(34,197,94,0.12)] text-[#86efac]"
            : "border border-line bg-[rgba(167,79,255,0.1)] text-[#c9bddc]"
        }`}>
          {partida.status === "finalizada" ? "Finalizada" : "Pendente"}
        </span>
      </div>
      <div className="grid min-w-0 gap-1">
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
    () => buildEliminationTopPlayers(partidas, firstCutRound, standings, {
      totalRodadas: torneio?.totalRodadas,
    }),
    [partidas, firstCutRound, standings, torneio?.totalRodadas],
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
    <section className="relative max-w-full min-w-0 overflow-hidden rounded-2xl border border-line bg-[linear-gradient(160deg,rgba(34,19,69,0.6),rgba(15,10,29,0.85))] p-5 shadow-[0_4px_20px_rgba(3,2,8,0.3)] animate-[slide-up_400ms_ease-out] before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:bg-[linear-gradient(90deg,#facc15,#c795ff,#8e39ed,#c795ff,#facc15)] before:bg-[length:200%_100%] max-md:p-4">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2.5">
          <h2 className="m-0 font-['Bebas_Neue',sans-serif] text-[1.5rem] tracking-[0.04em] text-text-main max-md:text-[1.35rem]">
            Top {corteTop}
          </h2>
          <span className="inline-flex h-8 items-center rounded-full border border-[rgba(250,204,21,0.35)] bg-[rgba(250,204,21,0.1)] px-3 text-[0.72rem] font-semibold text-[#fde68a]">
            Eliminatória
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {canExportStory && (
            <Tooltip content={`Gerar imagem do Top ${corteTop} eliminatório`} focusable={false}>
              <button
                type="button"
                className="inline-flex h-9 items-center gap-[0.35rem] whitespace-nowrap rounded-full border border-[rgba(255,215,0,0.45)] bg-[rgba(255,215,0,0.1)] px-[0.85rem] font-['inherit'] text-[0.76rem] font-bold tracking-[0.02em] text-[#fcd34d] transition-[background,border-color,color] duration-[180ms] hover:border-[rgba(255,215,0,0.65)] hover:bg-[rgba(255,215,0,0.2)] hover:text-[#ffe168]"
                onClick={() => setShowStory(true)}
                aria-label={`Exportar imagem do Top ${corteTop}`}
              >
                <ImageDown size={14} aria-hidden="true" />
                Top {corteTop} Story
              </button>
            </Tooltip>
          )}
          <div className="inline-flex h-9 max-w-[240px] items-center gap-2 rounded-xl border border-line bg-[rgba(167,79,255,0.08)] px-3 max-md:max-w-none">
            <span className="shrink-0 text-[0.65rem] font-bold uppercase tracking-[0.08em] text-brand">Campeão</span>
            <strong className="min-w-0 truncate text-[0.82rem] font-semibold text-text-main">
              {championName ? <UsuarioNomeExibicao nome={championName} usuarioId={championId} /> : "A definir"}
            </strong>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto pb-1 [scrollbar-width:thin] [scrollbar-color:rgba(199,149,255,0.28)_transparent]">
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
                  <h3 className="m-0 text-[0.75rem] font-bold uppercase tracking-[0.08em] text-brand">
                    {getRoundLabel(participants)}
                  </h3>
                  <span className="rounded-full border border-line bg-[rgba(167,79,255,0.1)] px-2 py-0.5 text-[0.68rem] font-bold text-[#c9bddc]">
                    R{rodada}
                  </span>
                </div>
                <div
                  className="flex min-w-0 flex-col"
                  style={{ height: MATCH_BLOCK * baseSlots }}
                >
                  {matches.map((partida, index) => (
                    <div
                      key={partida.id || `${rodada}-${index}`}
                      className="flex min-w-0 shrink-0 items-center justify-center px-0.5"
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
          torneioId={torneio?.id || ""}
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
