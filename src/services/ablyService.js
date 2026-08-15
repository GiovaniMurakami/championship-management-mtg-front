import { Realtime } from "ably";
import { logError } from "../utils/logger";

let ablyClient = null;
let attachedChannels = 0;

export const getAblyClient = () => {
    if (!ablyClient) {
        const authUrl = import.meta.env.VITE_ABLY_AUTH_URL;
        const apiKey = import.meta.env.VITE_ABLY_API_KEY || import.meta.env.VITE_ABLY_KEY;

        if (authUrl) {
            ablyClient = new Realtime({ authUrl });
            return ablyClient;
        }

        if (!apiKey) {
            logError("[Ably] Configure VITE_ABLY_AUTH_URL ou VITE_ABLY_API_KEY no .env");
            return null;
        }

        ablyClient = new Realtime({ key: apiKey });
    }
    return ablyClient;
};

const subscribeIfPresent = (channel, eventName, callback) => {
    if (callback) {
        channel.subscribe(eventName, (msg) => callback(msg));
    }
};

export const subscribeToTournament = (torneioId, callbacks = {}) => {
    const client = getAblyClient();
    if (!client) return null;

    const channelName = `torneio-${torneioId}`;
    const channel = client.channels.get(channelName);

    subscribeIfPresent(channel, "rodada_iniciada", callbacks.onRodadaIniciada);
    subscribeIfPresent(channel, "resultado_registrado", callbacks.onResultadoRegistrado);
    subscribeIfPresent(channel, "torneio_finalizado", callbacks.onTorneioFinalizado);
    subscribeIfPresent(channel, "participante_inscrito", callbacks.onParticipanteInscrito);
    subscribeIfPresent(channel, "checkin_realizado", callbacks.onCheckinRealizado);
    subscribeIfPresent(channel, "deck_inserido", callbacks.onDeckInserido);
    subscribeIfPresent(channel, "resultado_contestado", callbacks.onResultadoContestado);
    subscribeIfPresent(channel, "torneio_iniciado", callbacks.onTorneioIniciado);
    subscribeIfPresent(channel, "jogador_dropou", callbacks.onJogadorDropou);
    subscribeIfPresent(channel, "resultado_ajustado", callbacks.onResultadoAjustado);
    subscribeIfPresent(channel, "corte_iniciado", callbacks.onCorteIniciado);
    subscribeIfPresent(channel, "jogador_ingressou", callbacks.onJogadorIngressou);
    subscribeIfPresent(channel, "total_rodadas_alterado", callbacks.onTotalRodadasAlterado);
    subscribeIfPresent(channel, "rodada_refeita", callbacks.onRodadaRefeita);

    attachedChannels += 1;
    return channel;
};

function closeAblyIfIdle() {
    if (attachedChannels > 0 || !ablyClient) return;
    ablyClient.close();
    ablyClient = null;
}

export const unsubscribeFromTournament = (channel) => {
    if (!channel) return;
    channel.unsubscribe();
    if (typeof channel.detach === "function") {
        channel.detach();
    }
    attachedChannels = Math.max(0, attachedChannels - 1);
    closeAblyIfIdle();
};
