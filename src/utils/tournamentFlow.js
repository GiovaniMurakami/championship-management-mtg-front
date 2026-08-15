export const NEXT_ROUND_ACTION = {
    NONE: "none",
    NEXT_SWISS_ROUND: "next-swiss-round",
    START_TOP_CUT: "start-top-cut",
    ADVANCE_TOP_CUT: "advance-top-cut",
    FINISH_TOURNAMENT: "finish-tournament",
};

const toPositiveNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

export function calculateAutomaticSwissRounds(playerCount) {
    const totalPlayers = toPositiveNumber(playerCount);

    if (totalPlayers < 2) {
        return 0;
    }

    return Math.ceil(Math.log2(totalPlayers));
}

export function calculateSwissRounds(playerCount, maxRodadas) {
    const automaticRounds = calculateAutomaticSwissRounds(playerCount);
    const forcedRounds = toPositiveNumber(maxRodadas);

    // maxRodadas força o total Swiss (pode ser maior ou menor que o log2).
    if (forcedRounds) {
        return forcedRounds;
    }

    return automaticRounds;
}

export function hasTopCut(torneio) {
    return toPositiveNumber(torneio?.corteTop) > 0;
}

/** Label do chip "Rodada X / Y" — evita "Sem limite" quando o total ainda não chegou no estado. */
export function formatTournamentRoundLabel(torneio) {
    const atual = Number(torneio?.rodadaAtual);
    const total = Number(torneio?.totalRodadas);
    const atualLabel = Number.isFinite(atual) && atual >= 0 ? String(atual) : "—";
    const totalValido = Number.isFinite(total) && total > 0;

    if (totalValido) {
        return `${atualLabel} / ${total}`;
    }

    if (torneio?.status === "inscricoes_abertas") {
        return "—";
    }

    // Em andamento/finalizado sem total ainda sincronizado: não mentir "Sem limite".
    return atualLabel;
}

export function isEliminationPhase(torneio) {
    if (!hasTopCut(torneio)) {
        return false;
    }

    if (torneio?.emCorte === true) {
        return true;
    }

    return toPositiveNumber(torneio?.rodadaAtual) > toPositiveNumber(torneio?.totalRodadas);
}

/**
 * Primeira rodada do corte. Null no Swiss: `totalRodadas` ainda é só o Swiss,
 * então contar `total - log2(top)` para trás pega mesas suíças (ex.: 72 mesas na R6).
 */
export function getFirstEliminationRound(torneio) {
    if (!torneio?.emCorte) {
        return null;
    }

    const corteTop = toPositiveNumber(torneio?.corteTop);
    const totalRodadas = toPositiveNumber(torneio?.totalRodadas);
    const cutRounds = Math.log2(corteTop);
    if (!Number.isInteger(cutRounds) || cutRounds <= 0 || !totalRodadas) {
        return null;
    }

    return totalRodadas - cutRounds + 1;
}

export function isSwissLastRound(torneio) {
    const totalRounds = toPositiveNumber(torneio?.totalRodadas);
    const currentRound = toPositiveNumber(torneio?.rodadaAtual);

    if (!totalRounds) {
        return false;
    }

    return currentRound >= totalRounds;
}

export function shouldRequestNextRoundCheckin(torneio) {
    if (torneio?.status !== "em_andamento") {
        return false;
    }

    if (isEliminationPhase(torneio)) {
        return false;
    }

    return true;
}

export function getTournamentNextAction(torneio) {
    if (torneio?.status !== "em_andamento") {
        return NEXT_ROUND_ACTION.NONE;
    }

    if (isEliminationPhase(torneio)) {
        return NEXT_ROUND_ACTION.ADVANCE_TOP_CUT;
    }

    if (isSwissLastRound(torneio)) {
        return hasTopCut(torneio)
            ? NEXT_ROUND_ACTION.START_TOP_CUT
            : NEXT_ROUND_ACTION.FINISH_TOURNAMENT;
    }

    return NEXT_ROUND_ACTION.NEXT_SWISS_ROUND;
}

export function getNextRoundActionLabels(torneio, pendingCheckinCount = 0) {
    const nextAction = getTournamentNextAction(torneio);
    const pendingCount = toPositiveNumber(pendingCheckinCount);

    switch (nextAction) {
        case NEXT_ROUND_ACTION.NEXT_SWISS_ROUND:
            return {
                action: nextAction,
                cta: "Iniciar Próxima Rodada",
                blockedCta: "Iniciar Próxima Rodada",
                status:
                    pendingCount > 0
                        ? `${pendingCount} jogador(es) ainda não confirmaram presença`
                        : "Pronto para gerar a próxima rodada",
            };
        case NEXT_ROUND_ACTION.START_TOP_CUT:
            return {
                action: nextAction,
                cta: "Entrar no Corte",
                blockedCta: "Entrar no Corte",
                status: hasTopCut(torneio)
                    ? `Rodada suíça encerrada. Pronto para iniciar o corte Top ${toPositiveNumber(torneio?.corteTop)}`
                    : "Rodada suíça encerrada. Pronto para iniciar o corte",
            };
        case NEXT_ROUND_ACTION.ADVANCE_TOP_CUT:
            return {
                action: nextAction,
                cta: "Avançar Corte",
                blockedCta: "Avançar Corte",
                status: "Fase eliminatória pronta para avançar",
            };
        case NEXT_ROUND_ACTION.FINISH_TOURNAMENT:
            return {
                action: nextAction,
                cta: "Finalizar Torneio",
                blockedCta: "Finalizar Torneio",
                status: "Rodada suíça encerrada. Pronto para finalizar",
            };
        default:
            return {
                action: NEXT_ROUND_ACTION.NONE,
                cta: "",
                blockedCta: "",
                status: "",
            };
    }
}
