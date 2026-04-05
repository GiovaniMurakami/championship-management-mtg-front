import { Realtime } from "ably";

let ablyClient = null;

export const getAblyClient = () => {
    if (!ablyClient) {
        const apiKey = import.meta.env.VITE_ABLY_API_KEY;
        if (!apiKey) {
            console.error("[Ably] VITE_ABLY_API_KEY não encontrada no .env");
            return null;
        }
        ablyClient = new Realtime({ key: apiKey });
    }
    return ablyClient;
};

export const subscribeToTournament = (torneioId, callbacks) => {
    const client = getAblyClient();
    if (!client) return null;

    const channelName = `torneio-${torneioId}`;
    const channel = client.channels.get(channelName);

    if (callbacks.onRodadaIniciada) {
        channel.subscribe("rodada_iniciada", (msg) => {
            callbacks.onRodadaIniciada(msg);
        });
    }
    if (callbacks.onResultadoRegistrado) {
        channel.subscribe("resultado_registrado", (msg) => {
            callbacks.onResultadoRegistrado(msg);
        });
    }
    if (callbacks.onStandingsAtualizados) {
        channel.subscribe("standings_atualizados", (msg) => {
            callbacks.onStandingsAtualizados(msg);
        });
    }
    if (callbacks.onTorneioFinalizado) {
        channel.subscribe("torneio_finalizado", (msg) => {
            callbacks.onTorneioFinalizado(msg);
        });
    }
    if (callbacks.onParticipanteInscrito) {
        channel.subscribe("participante_inscrito", (msg) => {
            callbacks.onParticipanteInscrito(msg);
        });
    }
    if (callbacks.onCheckinRealizado) {
        channel.subscribe("checkin_realizado", (msg) => {
            callbacks.onCheckinRealizado(msg);
        });
    }
    if (callbacks.onDeckInserido) {
        channel.subscribe("deck_inserido", (msg) => {
            callbacks.onDeckInserido(msg);
        });
    }
    if (callbacks.onResultadoContestado) {
        channel.subscribe("resultado_contestado", (msg) => {
            callbacks.onResultadoContestado(msg);
        });
    }
    if (callbacks.onTorneioIniciado) {
        channel.subscribe("torneio_iniciado", (msg) => callbacks.onTorneioIniciado(msg));
    }
    if (callbacks.onJogadorDropou) {
        channel.subscribe("jogador_dropou", (msg) => callbacks.onJogadorDropou(msg));
    }
    if (callbacks.onResultadoAjustado) {
        channel.subscribe("resultado_ajustado", (msg) => callbacks.onResultadoAjustado(msg));
    }
    if (callbacks.onCorteIniciado) {
        channel.subscribe("corte_iniciado", (msg) => callbacks.onCorteIniciado(msg));
    }
    if (callbacks.onJogadorIngressou) {
        channel.subscribe("jogador_ingressou", (msg) => callbacks.onJogadorIngressou(msg));
    }
    if (callbacks.onTotalRodadasAlterado) {
        channel.subscribe("total_rodadas_alterado", (msg) => callbacks.onTotalRodadasAlterado(msg));
    }
    if (callbacks.onCheckinRodadaAberto) {
        channel.subscribe("checkin_rodada_aberto", (msg) => callbacks.onCheckinRodadaAberto(msg));
    }

    return channel;
};

export const unsubscribeFromTournament = (channel) => {
    if (channel) {
        channel.unsubscribe();
        channel.detach();
    }
};