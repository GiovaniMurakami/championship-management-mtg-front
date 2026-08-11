/**
 * Calculadora Swiss / Top cut — modelo clássico usado por calculadoras MTG
 * (fórmula MTGSalvation / bluebones; mesma saída da Cards Realm para campos sem bye).
 *
 * Ref: https://bluebones.net/2020/10/calculating-swiss-record-required-to-reach-elimination-rounds/
 * Ref: https://mtg.cardsrealm.com/pt-br/tools/swiss-tournament-top8-calculator
 */

/** Tabela de rodadas recomendadas (potência de 2), como na Cards Realm. */
export const SWISS_ROUNDS_TABLE = [
  { minPlayers: 2, maxPlayers: 2, rounds: 1 },
  { minPlayers: 3, maxPlayers: 4, rounds: 2 },
  { minPlayers: 5, maxPlayers: 8, rounds: 3 },
  { minPlayers: 9, maxPlayers: 16, rounds: 4 },
  { minPlayers: 17, maxPlayers: 32, rounds: 5 },
  { minPlayers: 33, maxPlayers: 64, rounds: 6 },
  { minPlayers: 65, maxPlayers: 128, rounds: 7 },
  { minPlayers: 129, maxPlayers: 256, rounds: 8 },
];

export function recommendedSwissRounds(playerCount) {
  const n = Number(playerCount);
  if (!Number.isFinite(n) || n < 2) return 0;
  if (n > 256) return Math.ceil(Math.log2(n));
  const row = SWISS_ROUNDS_TABLE.find((r) => n >= r.minPlayers && n <= r.maxPlayers);
  return row ? row.rounds : Math.ceil(Math.log2(n));
}

/**
 * Distribuição esperada por número de derrotas (sem empates, skill igual).
 * Retorna array ordenado do melhor para o pior record: { wins, losses, draws, players }
 */
export function swissRecordDistribution(numPlayers, numRounds) {
  const players = Number(numPlayers);
  const rounds = Number(numRounds);
  if (!Number.isFinite(players) || players < 1 || !Number.isInteger(rounds) || rounds < 1) {
    return [];
  }

  const base = players / 2 ** rounds;
  let multiplier = 1;
  const rows = [];

  for (let losses = 0; losses <= rounds; losses += 1) {
    const wins = rounds - losses;
    if (losses > 0) {
      multiplier *= (wins + 1) / losses;
    }
    rows.push({
      wins,
      losses,
      draws: 0,
      players: base * multiplier,
    });
  }

  return rows;
}

/**
 * Mescla jogadores com bye intencional (vitórias gratuitas no início).
 * Bye players jogam (rounds - byesPerPlayer) rodadas e somam as vitórias de bye.
 */
export function swissRecordDistributionWithByes(
  numPlayers,
  numRounds,
  playersWithBye = 0,
  byesPerPlayer = 0,
) {
  const players = Number(numPlayers);
  const rounds = Number(numRounds);
  const byePlayers = Math.max(0, Math.min(Number(playersWithBye) || 0, players));
  const byesEach = Math.max(0, Number(byesPerPlayer) || 0);

  if (!byePlayers || !byesEach) {
    return swissRecordDistribution(players, rounds);
  }

  if (byesEach > rounds) {
    return [];
  }

  const withoutBye = players - byePlayers;
  const remainingRounds = rounds - byesEach;
  const merged = new Map();

  const addRows = (rows, winOffset = 0) => {
    rows.forEach((row) => {
      const wins = row.wins + winOffset;
      const losses = row.losses;
      const key = `${wins}-${losses}`;
      const prev = merged.get(key);
      if (prev) {
        prev.players += row.players;
      } else {
        merged.set(key, {
          wins,
          losses,
          draws: 0,
          players: row.players,
        });
      }
    });
  };

  if (withoutBye > 0) {
    addRows(swissRecordDistribution(withoutBye, rounds));
  }

  if (byePlayers > 0) {
    if (remainingRounds === 0) {
      addRows([{ wins: 0, losses: 0, draws: 0, players: byePlayers }], byesEach);
    } else {
      addRows(swissRecordDistribution(byePlayers, remainingRounds), byesEach);
    }
  }

  return Array.from(merged.values()).sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    return a.losses - b.losses;
  });
}

/**
 * Converte contagens fracionárias em inteiros (método do maior resto),
 * garantindo que a soma seja exatamente totalPlayers.
 */
export function integerizePlayerCounts(rows, totalPlayers) {
  const total = Number(totalPlayers);
  if (!Array.isArray(rows) || !Number.isFinite(total) || total < 0) return [];

  const prepared = rows.map((row, index) => {
    const raw = Number(row.players) || 0;
    const floor = Math.floor(raw);
    return {
      ...row,
      index,
      players: floor,
      remainder: raw - floor,
    };
  });

  let remaining = Math.round(total) - prepared.reduce((sum, row) => sum + row.players, 0);

  const byRemainder = [...prepared].sort((a, b) => {
    if (b.remainder !== a.remainder) return b.remainder - a.remainder;
    return a.index - b.index;
  });

  for (let i = 0; i < byRemainder.length && remaining > 0; i += 1) {
    byRemainder[i].players += 1;
    remaining -= 1;
  }

  // Se arredondamos acima do total (caso raro), remove dos menores restos
  if (remaining < 0) {
    const bySmallest = [...prepared].sort((a, b) => {
      if (a.remainder !== b.remainder) return a.remainder - b.remainder;
      return b.index - a.index;
    });
    for (let i = 0; i < bySmallest.length && remaining < 0; i += 1) {
      if (bySmallest[i].players > 0) {
        bySmallest[i].players -= 1;
        remaining += 1;
      }
    }
  }

  return prepared
    .sort((a, b) => a.index - b.index)
    .map(({ index, remainder, ...row }) => row);
}

/**
 * Calcula probabilidade de top cut para cada record.
 */
export function calculateTopCutProbabilities({
  players,
  rounds,
  topCut,
  playersWithBye = 0,
  byesPerPlayer = 0,
}) {
  const rawDistribution = swissRecordDistributionWithByes(
    players,
    rounds,
    playersWithBye,
    byesPerPlayer,
  );
  const distribution = integerizePlayerCounts(rawDistribution, players);

  let spotsLeft = Number(topCut) || 0;
  const rows = distribution.map((row) => {
    const count = row.players;
    let probability = 0;
    let status = "eliminado";

    if (spotsLeft <= 0 || count <= 0) {
      probability = 0;
      status = "eliminado";
    } else if (count <= spotsLeft) {
      probability = 100;
      spotsLeft -= count;
      status = "garantido";
    } else {
      probability = (spotsLeft / count) * 100;
      spotsLeft = 0;
      status = "bolha";
    }

    return {
      ...row,
      recordLabel: `${row.wins}-${row.losses}-${row.draws}`,
      players: count,
      probability,
      status,
    };
  });

  const guaranteed = [...rows].reverse().find((r) => r.status === "garantido") || null;

  return {
    rows,
    guaranteedRecord: guaranteed ? guaranteed.recordLabel : null,
    recommendedRounds: recommendedSwissRounds(players),
  };
}

export function formatPlayerCount(value) {
  if (!Number.isFinite(value)) return "—";
  return String(Math.round(value));
}
