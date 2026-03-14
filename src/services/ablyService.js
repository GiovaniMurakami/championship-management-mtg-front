import { Realtime } from "ably";

let ablyClient = null;

export const getAblyClient = () => {
    if (!ablyClient) {
        const apiKey = import.meta.env.VITE_ABLY_API_KEY;
        if (!apiKey) {
            console.error("[Ably] VITE_ABLY_API_KEY não encontrada no .env");
            return null;
        }
        console.log("[Ably] Criando cliente Realtime...");
        ablyClient = new Realtime({ key: apiKey });

        ablyClient.connection.on((stateChange) => {
            console.log(
                `[Ably] Conexão: ${stateChange.previous} → ${stateChange.current}`,
                stateChange.reason ? `| Erro: ${stateChange.reason.message}` : ""
            );
        });
    }
    return ablyClient;
};

export const subscribeToTournament = (torneioId, callbacks) => {
    const client = getAblyClient();
    if (!client) return null;

    const channelName = `torneio-${torneioId}`;
    const channel = client.channels.get(channelName);

    console.log(`[Ably] Inscrevendo no canal: ${channelName}`);

    channel.on((stateChange) => {
        console.log(
            `[Ably] Canal "${channelName}": ${stateChange.previous} → ${stateChange.current}`,
            stateChange.reason ? `| Erro: ${stateChange.reason.message}` : ""
        );
    });

    if (callbacks.onRodadaIniciada) {
        channel.subscribe("rodada_iniciada", (msg) => {
            console.log(`[Ably] Evento recebido "rodada_iniciada":`, msg.data);
            callbacks.onRodadaIniciada(msg);
        });
    }
    if (callbacks.onResultadoRegistrado) {
        channel.subscribe("resultado_registrado", (msg) => {
            console.log(`[Ably] Evento recebido "resultado_registrado":`, msg.data);
            callbacks.onResultadoRegistrado(msg);
        });
    }
    if (callbacks.onStandingsAtualizados) {
        channel.subscribe("standings_atualizados", (msg) => {
            console.log(`[Ably] Evento recebido "standings_atualizados":`, msg.data);
            callbacks.onStandingsAtualizados(msg);
        });
    }
    if (callbacks.onTorneioFinalizado) {
        channel.subscribe("torneio_finalizado", (msg) => {
            console.log(`[Ably] Evento recebido "torneio_finalizado":`, msg.data);
            callbacks.onTorneioFinalizado(msg);
        });
    }
    if (callbacks.onParticipanteInscrito) {
        channel.subscribe("participante_inscrito", (msg) => {
            console.log(`[Ably] Evento recebido "participante_inscrito":`, msg.data);
            callbacks.onParticipanteInscrito(msg);
        });
    }
    if (callbacks.onCheckinRealizado) {
        channel.subscribe("checkin_realizado", (msg) => {
            console.log(`[Ably] Evento recebido "checkin_realizado":`, msg.data);
            callbacks.onCheckinRealizado(msg);
        });
    }

    return channel;
};

export const unsubscribeFromTournament = (channel) => {
    if (channel) {
        console.log(`[Ably] Desinscrevendo do canal: ${channel.name}`);
        channel.unsubscribe();
    }
};