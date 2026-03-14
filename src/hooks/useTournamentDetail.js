import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
    getStandings,
    escolherDeckTorneio,
    checkinTorneio,
    inscreverTorneio,
    registrarResultado,
    buscarTorneio,
} from "../services/backendApi";
import {
    subscribeToTournament,
    unsubscribeFromTournament,
} from "../services/ablyService";
import { useAuth } from "./useAuth";
import { useMyDecks } from "./useMyDecks";

export function useTournamentDetail() {
    const { token, usuario } = useAuth();
    const { id: torneioId } = useParams();

    const [torneio, setTorneio] = useState(null);
    const [standings, setStandings] = useState([]);
    const [partidas, setPartidas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [selectedDeckId, setSelectedDeckId] = useState("");
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const { decks } = useMyDecks(token, usuario?.id);

    const loadTournament = useCallback(async () => {
        if (!torneioId || !token) return;
        setLoading(true);
        setError("");
        try {
            const data = await buscarTorneio(torneioId, token);
            setTorneio(data);
            setPartidas(data.partidas || data.rodadaAtualPartidas || []);
        } catch (err) {
            setError("Erro ao carregar dados do torneio.");
            console.error(err);
        } finally {
            setLoading(false);
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

    // Initial load
    useEffect(() => {
        loadTournament();
        loadStandings();
    }, [loadTournament, loadStandings]);

    // Ably realtime subscriptions
    useEffect(() => {
        if (!torneioId) return;
        const channel = subscribeToTournament(torneioId, {
            onRodadaIniciada: () => {
                loadTournament();
                loadStandings();
            },
            onResultadoRegistrado: () => loadStandings(),
            onStandingsAtualizados: () => loadStandings(),
            onTorneioFinalizado: () => {
                loadTournament();
                loadStandings();
            },
            onParticipanteInscrito: (msg) => {
                const { usuarioId, inscricaoId, usuarioNome } = msg.data;
                setStandings((prev) => {
                    const jaExiste = prev.some((p) => p.usuarioId === usuarioId || p.id === usuarioId);
                    if (jaExiste) return prev;
                    return [...prev, { id: usuarioId, usuarioId, inscricaoId, nome: usuarioNome, pontos: 0 }];
                });
                setTorneio((prev) =>
                    prev ? { ...prev, totalInscritos: (prev.totalInscritos || 0) + 1 } : prev
                );
            },
            onCheckinRealizado: (msg) => {
                const { usuarioId } = msg.data;
                setStandings((prev) =>
                    prev.map((p) =>
                        p.usuarioId === usuarioId || p.id === usuarioId
                            ? { ...p, checkin: true }
                            : p
                    )
                );
            },
            onDeckInserido: (msg) => {
                const { usuarioId, deckConfirmado } = msg.data;
                setStandings((prev) =>
                    prev.map((p) =>
                        p.usuarioId === usuarioId || p.id === usuarioId
                            ? { ...p, deckConfirmado }
                            : p
                    )
                );
            },
        });
        return () => {
            if (channel) unsubscribeFromTournament(channel);
        };
    }, [torneioId, loadTournament, loadStandings]);

    // Find the current player entry in standings
    const currentPlayer = useMemo(() => {
        return (
            standings.find(
                (p) => p.usuarioId === usuario?.id || p.id === usuario?.id
            ) || null
        );
    }, [standings, usuario?.id]);

    // Find my current match
    const myMatch = useMemo(() => {
        if (!usuario?.id || !partidas.length) return null;
        return (
            partidas.find(
                (p) =>
                    p.jogador1Id === usuario.id ||
                    p.jogador2Id === usuario.id ||
                    p.jogador1?.id === usuario.id ||
                    p.jogador2?.id === usuario.id
            ) || null
        );
    }, [partidas, usuario?.id]);

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
        setActionLoading(true);
        setError("");
        try {
            await escolherDeckTorneio(torneioId, selectedDeckId, token);
            setSuccessMsg("Deck selecionado com sucesso!");
            await loadStandings();
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
            clearMessages();
        } catch (err) {
            setError(err.message || "Erro ao registrar resultado.");
            clearMessages();
        } finally {
            setActionLoading(false);
        }
    };

    return {
        torneio,
        standings,
        partidas,
        loading,
        actionLoading,
        error,
        successMsg,
        currentPlayer,
        myMatch,
        decks,
        selectedDeckId,
        setSelectedDeckId,
        handleChooseDeck,
        handleCheckin,
        handleInscrever,
        handleReportResult,
        usuario,
    };
}
