import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
    getStandings,
    escolherDeckTorneio,
    checkinTorneio,
    inscreverTorneio,
    registrarResultado,
    buscarTorneio,
    proximaRodada,
    dropJogador,
    listarPartidasTorneio,
    atualizarTorneio,
    deletarTorneio,
} from "../services/backendApi";
import {
    subscribeToTournament,
    unsubscribeFromTournament,
} from "../services/ablyService";
import { useAuth } from "./useAuth";
import { useMyDecks } from "./useMyDecks";

export function useTournamentDetail() {
    const { token, usuario, isAdmin } = useAuth();
    const { id: torneioId } = useParams();

    const [torneio, setTorneio] = useState(null);
    const [standings, setStandings] = useState([]);
    const [partidas, setPartidas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [droppingPlayerId, setDroppingPlayerId] = useState("");
    const [selectedDeckId, setSelectedDeckId] = useState("");
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const { decks } = useMyDecks(token, usuario?.id);
    const normalizeId = (value) => (value === undefined || value === null ? "" : String(value));
    const isCheckedForNextRound = (player) =>
        Boolean(
            player?.checkInProximaRodada
            || player?.checkinProximaRodada
            || player?.nextRoundCheckin,
        );

    const loadTournament = useCallback(async () => {
        if (!torneioId || !token) return;
        setError("");
        try {
            const data = await buscarTorneio(torneioId, token);
            setTorneio(data);
            setPartidas(data.partidas || data.rodadaAtualPartidas || []);
        } catch (err) {
            setError("Erro ao carregar dados do torneio.");
            console.error(err);
        }
    }, [torneioId, token]);

    const loadPartidas = useCallback(async () => {
        if (!torneioId || !token) return;

        try {
            const data = await listarPartidasTorneio(torneioId, token);
            const partidasList = data?.partidas || data?.matches || [];

            if (Array.isArray(partidasList) && partidasList.length > 0) {
                setPartidas(partidasList);
            }
        } catch {
            // Fallback: manter partidas carregadas por buscarTorneio/standings.
        }
    }, [torneioId, token]);

    const loadStandings = useCallback(async () => {
        if (!torneioId || !token) return;
        try {
            const data = await getStandings(torneioId, token);
            setStandings(data.standings || data.participantes || data.players || []);
            if (data.partidas || data.rodadaAtualPartidas) {
                setPartidas(data.partidas || data.rodadaAtualPartidas || []);
            }
            // Merge tournament-level data if present
            if (data.nome || data.torneioNome) {
                setTorneio((prev) => prev ? { ...prev, ...data } : data);
            }
        } catch (err) {
            console.error("Erro ao carregar standings:", err);
        }
    }, [torneioId, token]);

    // Initial load — wait for all three before hiding skeleton
    useEffect(() => {
        if (!torneioId || !token) {
            setLoading(false);
            return;
        }
        setLoading(true);
        Promise.all([loadTournament(), loadStandings(), loadPartidas()])
            .finally(() => setLoading(false));
    }, [loadTournament, loadStandings, loadPartidas]);

    // Ably realtime subscriptions
    useEffect(() => {
        if (!torneioId) return;
        const channel = subscribeToTournament(torneioId, {
            onRodadaIniciada: () => {
                loadTournament();
                loadStandings();
                loadPartidas();
            },
            onResultadoRegistrado: () => {
                loadStandings();
                loadPartidas();
            },
            onStandingsAtualizados: () => loadStandings(),
            onTorneioFinalizado: () => {
                loadTournament();
                loadStandings();
                loadPartidas();
            },
            onParticipanteInscrito: (msg) => {
                const data = msg.data;
                const usuarioId = data.usuario?.id || data.usuarioId;
                const usuarioNome = data.usuario?.nome || data.usuarioNome;
                const inscricaoId = data.inscricaoId || data.id;
                setStandings((prev) => {
                    const jaExiste = prev.some(
                        (p) => p.usuario?.id === usuarioId || p.usuarioId === usuarioId || p.id === usuarioId
                    );
                    if (jaExiste) return prev;
                    return [...prev, { usuario: { id: usuarioId, nome: usuarioNome }, id: usuarioId, usuarioId, inscricaoId, nome: usuarioNome, pontos: 0 }];
                });
                setTorneio((prev) =>
                    prev ? { ...prev, totalInscritos: (prev.totalInscritos || 0) + 1 } : prev
                );
            },
            onCheckinRealizado: (msg) => {
                const usuarioId = msg.data.usuario?.id || msg.data.usuarioId;
                setStandings((prev) =>
                    prev.map((p) =>
                        p.usuario?.id === usuarioId || p.usuarioId === usuarioId || p.id === usuarioId
                            ? {
                                ...p,
                                checkin: true,
                                checkIn: true,
                                checkInProximaRodada: true,
                                checkinProximaRodada: true,
                            }
                            : p
                    )
                );
            },
            onDeckInserido: (msg) => {
                const usuarioId = msg.data.usuario?.id || msg.data.usuarioId;
                const deckConfirmado = msg.data.deckConfirmado;
                setStandings((prev) =>
                    prev.map((p) =>
                        p.usuario?.id === usuarioId || p.usuarioId === usuarioId || p.id === usuarioId
                            ? { ...p, deckConfirmado }
                            : p
                    )
                );
            },
            onMesaAtualizada: () => {
                loadPartidas();
            },
        });
        return () => {
            if (channel) unsubscribeFromTournament(channel);
        };
    }, [torneioId, loadTournament, loadStandings, loadPartidas]);

    // Find the current player entry in standings
    const currentPlayer = useMemo(() => {
        return (
            standings.find(
                (p) =>
                    normalizeId(p.usuario?.id) === normalizeId(usuario?.id) ||
                    normalizeId(p.usuarioId) === normalizeId(usuario?.id) ||
                    normalizeId(p.id) === normalizeId(usuario?.id)
            ) || null
        );
    }, [standings, usuario?.id]);

    const isOwner = useMemo(
        () => normalizeId(torneio?.donoId) === normalizeId(usuario?.id),
        [torneio?.donoId, usuario?.id],
    );

    const pendingCheckinPlayers = useMemo(() => {
        if (torneio?.status !== "em_andamento") return [];

        const isLastRound =
            Number(torneio?.totalRodadas || 0) > 0 &&
            Number(torneio?.rodadaAtual || 0) >= Number(torneio?.totalRodadas || 0);

        if (isLastRound) return [];

        return (standings || []).filter((player) => !player?.dropped && !isCheckedForNextRound(player));
    }, [standings, torneio?.status, torneio?.rodadaAtual, torneio?.totalRodadas]);

    // Find my current match — filter to current round to avoid showing stale round matches
    const myMatch = useMemo(() => {
        if (!usuario?.id || !partidas.length) return null;
        const rodadaAtual = torneio?.rodadaAtual ? Number(torneio.rodadaAtual) : null;
        const currentRoundPartidas = rodadaAtual
            ? partidas.filter((p) => Number(p.rodada) === rodadaAtual)
            : partidas;
        const source = currentRoundPartidas.length > 0 ? currentRoundPartidas : partidas;
        return (
            source.find(
                (p) =>
                    normalizeId(p.jogador1Id) === normalizeId(usuario.id) ||
                    normalizeId(p.jogador2Id) === normalizeId(usuario.id) ||
                    normalizeId(p.jogador1?.id) === normalizeId(usuario.id) ||
                    normalizeId(p.jogador2?.id) === normalizeId(usuario.id)
            ) || null
        );
    }, [partidas, usuario?.id, torneio?.rodadaAtual]);

    // Set deck from current entry
    useEffect(() => {
        if (currentPlayer) {
            setSelectedDeckId(
                currentPlayer.deckId || currentPlayer.deck?.id || ""
            );
        }
    }, [currentPlayer]);

    const clearMessages = () => {
        setTimeout(() => {
            setError("");
            setSuccessMsg("");
        }, 3000);
    };

    const handleChooseDeck = async () => {
        if (!selectedDeckId || !torneioId) return;
        if (torneio?.status !== "inscricoes_abertas") {
            setError("Não é possível trocar de deck após o início do torneio.");
            clearMessages();
            return;
        }
        setActionLoading(true);
        setError("");
        try {
            await escolherDeckTorneio(torneioId, selectedDeckId, token);
            setSuccessMsg("Deck selecionado com sucesso!");
            await loadStandings();
            await loadPartidas();
            clearMessages();
        } catch (err) {
            setError(err.message || "Erro ao escolher deck.");
            clearMessages();
        } finally {
            setActionLoading(false);
        }
    };

    const handleCheckin = async () => {
        if (!torneioId) return;
        setActionLoading(true);
        setError("");
        try {
            await checkinTorneio(torneioId, token);
            setSuccessMsg("Check-in realizado!");
            await loadStandings();
            clearMessages();
        } catch (err) {
            setError(err.message || "Erro ao efetuar check-in.");
            clearMessages();
        } finally {
            setActionLoading(false);
        }
    };

    const handleInscrever = async () => {
        if (!torneioId) return;
        setActionLoading(true);
        setError("");
        try {
            await inscreverTorneio(torneioId, token);
            setSuccessMsg("Inscrição realizada com sucesso!");
            await loadTournament();
            await loadStandings();
            clearMessages();
        } catch (err) {
            setError(err.message || "Erro ao se inscrever.");
            // Reload tournament state on max-players error so UI reflects full capacity
            if (err.message?.includes("limite máximo")) {
                await loadTournament();
                await loadStandings();
            }
            clearMessages();
        } finally {
            setActionLoading(false);
        }
    };

    const handleReportResult = async (partidaId, resultado) => {
        if (!partidaId) return;
        setActionLoading(true);
        setError("");
        try {
            await registrarResultado(partidaId, resultado, token);
            setSuccessMsg("Resultado registrado!");
            await loadStandings();
            await loadPartidas();
            clearMessages();
        } catch (err) {
            setError(err.message || "Erro ao registrar resultado.");
            clearMessages();
        } finally {
            setActionLoading(false);
        }
    };

    const handleNextRound = async () => {
        if (!torneioId || !isOwner) return;
        if (pendingCheckinPlayers.length > 0) {
            const total = pendingCheckinPlayers.length;
            setError(
                `Não é possível iniciar a próxima rodada: faltam ${total} jogador(es) fazer check-in da próxima rodada.`,
            );
            clearMessages();
            return;
        }
        setActionLoading(true);
        setError("");
        try {
            const data = await proximaRodada(torneioId, token);
            if (data?.finalizado) {
                setSuccessMsg("Torneio finalizado com sucesso!");
            } else {
                setSuccessMsg(`Rodada ${data?.rodadaAtual || "seguinte"} iniciada!`);
            }
            await loadTournament();
            await loadStandings();
            await loadPartidas();
            clearMessages();
        } catch (err) {
            setError(err.message || "Erro ao avançar para a próxima rodada.");
            clearMessages();
        } finally {
            setActionLoading(false);
        }
    };

    const handleDropPlayer = async (jogadorId) => {
        if (!torneioId || !isOwner || !jogadorId) return;
        setActionLoading(true);
        setDroppingPlayerId(jogadorId);
        setError("");
        try {
            await dropJogador(torneioId, jogadorId, token);
            setSuccessMsg("Jogador dropado com sucesso!");
            await loadTournament();
            await loadStandings();
            await loadPartidas();
            clearMessages();
        } catch (err) {
            setError(err.message || "Erro ao dropar jogador.");
            clearMessages();
        } finally {
            setActionLoading(false);
            setDroppingPlayerId("");
        }
    };

    const handleEditTorneio = async (payload) => {
        if (!torneioId) return;
        setActionLoading(true);
        setError("");
        try {
            await atualizarTorneio(torneioId, payload, token);
            setSuccessMsg("Torneio atualizado com sucesso!");
            await loadTournament();
            clearMessages();
        } catch (err) {
            setError(err.message || "Erro ao atualizar torneio.");
            clearMessages();
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteTorneio = async () => {
        if (!torneioId) return;
        setActionLoading(true);
        setError("");
        try {
            await deletarTorneio(torneioId, token);
            return true;
        } catch (err) {
            setError(err.message || "Erro ao excluir torneio.");
            clearMessages();
            setActionLoading(false);
            return false;
        }
    };

    return {
        torneio,
        standings,
        partidas,
        loading,
        actionLoading,
        droppingPlayerId,
        error,
        successMsg,
        isOwner,
        pendingCheckinPlayers,
        currentPlayer,
        myMatch,
        decks,
        selectedDeckId,
        setSelectedDeckId,
        handleChooseDeck,
        handleCheckin,
        handleInscrever,
        handleReportResult,
        handleNextRound,
        handleDropPlayer,
        handleEditTorneio,
        handleDeleteTorneio,
        usuario,
        isAdmin,
        token,
    };
}
