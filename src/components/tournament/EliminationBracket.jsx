import { getMatchPlayerName } from "../../utils/matchDisplay";

function getFirstCutRound(torneio) {
  const corteTop = Number(torneio?.corteTop || 0);
  const totalRodadas = Number(torneio?.totalRodadas || 0);
  const cutRounds = Math.log2(corteTop);
  if (!Number.isInteger(cutRounds) || cutRounds <= 0 || totalRodadas <= 0) return null;
  return totalRodadas - cutRounds + 1;
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

function BracketPlayer({ name, score, isWinner, isBye }) {
  return (
    <div className={`flex items-center justify-between gap-3 rounded-md border px-3 py-2 ${
      isWinner
        ? "border-[rgba(250,204,21,0.48)] bg-[rgba(250,204,21,0.12)] text-[#fef3c7]"
        : "border-[rgba(217,180,255,0.12)] bg-[rgba(255,255,255,0.04)] text-[#d8cfee]"
    } ${isBye ? "opacity-55" : ""}`}>
      <span className="min-w-0 truncate text-sm font-semibold">{name}</span>
      <span className={`shrink-0 rounded px-2 py-0.5 text-xs font-black ${isWinner ? "bg-[rgba(250,204,21,0.2)] text-[#fde68a]" : "bg-[rgba(217,180,255,0.08)] text-[#beafd7]"}`}>
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
    <article className="relative rounded-lg border border-[rgba(217,180,255,0.16)] bg-[#0b0717] p-3 shadow-[0_10px_28px_rgba(0,0,0,0.22)]">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-[0.68rem] font-bold uppercase tracking-[0.08em] text-[#c795ff]">
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
      <div className="grid gap-2">
        <BracketPlayer
          name={getMatchPlayerName(partida, 1)}
          score={score1}
          isWinner={winnerId === jogador1Id}
        />
        <BracketPlayer
          name={isBye ? "BYE" : getMatchPlayerName(partida, 2)}
          score={score2}
          isWinner={winnerId === jogador2Id}
          isBye={isBye}
        />
      </div>
    </article>
  );
}

export function EliminationBracket({ torneio, partidas }) {
  const corteTop = Number(torneio?.corteTop || 0);
  const firstCutRound = getFirstCutRound(torneio);
  if (!corteTop || !firstCutRound) return null;

  const cutMatches = (partidas || [])
    .filter((partida) => Number(partida?.rodada) >= firstCutRound)
    .sort((a, b) => Number(a?.rodada ?? 0) - Number(b?.rodada ?? 0) || Number(a?.mesa ?? 0) - Number(b?.mesa ?? 0));

  if (cutMatches.length === 0) return null;

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

  return (
    <section className="overflow-hidden rounded-2xl border border-[rgba(250,204,21,0.22)] bg-[linear-gradient(160deg,rgba(42,29,10,0.78),rgba(14,10,25,0.92))] p-5 shadow-[0_4px_20px_rgba(3,2,8,0.34)]">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="m-0 text-xs font-black uppercase tracking-[0.12em] text-[#facc15]">Corte Top {corteTop}</p>
          <h2 className="m-0 mt-1 font-['Bebas_Neue',sans-serif] text-[1.7rem] tracking-[0.05em] text-[#f5edff]">
            Chaveamento eliminatorio
          </h2>
        </div>
        <div className="rounded-lg border border-[rgba(250,204,21,0.28)] bg-[rgba(250,204,21,0.1)] px-3 py-2 text-right">
          <span className="block text-[0.65rem] font-bold uppercase tracking-[0.08em] text-[#fde68a]">Campeao</span>
          <strong className="block max-w-[220px] truncate text-sm text-[#fff7cc]">{championName || "A definir"}</strong>
        </div>
      </div>

      <div className="overflow-x-auto pb-2 [scrollbar-width:thin] [scrollbar-color:rgba(250,204,21,0.28)_transparent]">
        <div className="grid min-w-[760px] auto-cols-[minmax(220px,1fr)] grid-flow-col gap-5">
          {rounds.map(([rodada, matches], roundIndex) => {
            const participants = corteTop / (2 ** roundIndex);
            return (
              <div key={rodada} className="grid content-center gap-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="m-0 text-sm font-black uppercase tracking-[0.08em] text-[#fde68a]">
                    {getRoundLabel(participants)}
                  </h3>
                  <span className="rounded-full border border-[rgba(250,204,21,0.24)] px-2 py-0.5 text-[0.68rem] font-bold text-[#d8cfee]">
                    R{rodada}
                  </span>
                </div>
                <div className="grid gap-4">
                  {matches.map((partida, index) => (
                    <BracketMatch key={partida.id || `${rodada}-${index}`} partida={partida} matchIndex={index} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
