import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { normalizeId } from "../utils/normalizeId";
import {
    escolherDeckTorneio,
    checkinTorneio,
    inscreverTorneio,
    inscreverTardio,
    iniciarTorneio,
    registrarResultado,
    contestarResultado,
    confirmarResultadoPartida,
    ajustarResultado,
    gerarLinkIngresso,
    proximaRodada,
    refazerRodada,
    dropJogador,
    atualizarTorneio,
    deletarTorneio,
} from "../services/backendApi";
import {
    subscribeToTournament,
    unsubscribeFromTournament,
} from "../services/ablyService";
import { useAuth } from "./useAuth";
import { useMyDecks } from "./useMyDecks";
import { useActionGuard } from "./useActionGuard";
import { useToast } from "../context/ToastContext";
import {
    getNextRoundActionLabels,
    getTournamentNextAction,
    shouldRequestNextRoundCheckin,
} from "../utils/tournamentFlow";
import {
    normalizeMatchesPayload,
    normalizeStandingsPayload,
    useTournamentQueries,
} from "./useTournamentQueries";

export function useTournamentDetail() {
    const { token, usuario, isAdmin } = useAuth();
    const { addToast } = useToast();
    const { id: torneioId } = useParams();

    const [torneio, setTorneio] = useState(null);
    const somRodadaRef = useRef(null);
    somRodadaRef.current = torneio?.somRodada ?? null;
    const [standings, setStandings] = useState([]);
    const [partidas, setPartidas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [droppingPlayerId, setDroppingPlayerId] = useState("");
    const [adminActionKey, setAdminActionKey] = useState("");
    const [selectedDeckId, setSelectedDeckId] = useState("");
    const [selectedTimeId, setSelectedTimeId] = useState("");
    const [times, setTimes] = useState([]);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [realtimeToast, setRealtimeToast] = useState(null); // { msg, type: "success"|"info"|"warning" }
    const [corteInfo, setCorteInfo] = useState(null); // { corteTop, jogadoresClassificados }
    const [checkinRodadaAberto, setCheckinRodadaAberto] = useState(false);
    const toastTimeoutRef = useRef(null);

    const { decks } = useMyDecks(token, usuario?.id);
    const {
        tournamentQuery,
        standingsQuery,
        matchesQuery,
        teamsQuery,
    } = useTournamentQueries({ torneioId, token });
    const guard = useActionGuard(800);
    const isCheckedForNextRound = (player, rodadaAtual) =>
        Number(player?.checkinRodada) >= Number(rodadaAtual);

    const showToast = useCallback((msg, type = "info") => {
        addToast(msg, { type });
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        setRealtimeToast({ msg, type });
        toastTimeoutRef.current = setTimeout(() => setRealtimeToast(null), 5000);
    }, [addToast]);

    // Cleanup toast timeout on unmount
    useEffect(() => () => { if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current); }, []);

    const mergePartidaState = useCallback((incomingPartida) => {
        if (!incomingPartida?.id) return false;

        let updated = false;

        setPartidas((prev) => prev.map((partida) => {
            if (normalizeId(partida?.id) !== normalizeId(incomingPartida.id)) return partida;

            updated = true;

            return {
                ...partida,
                ...incomingPartida,
                jogador1: incomingPartida.jogador1 ?? partida.jogador1,
                jogador2: incomingPartida.jogador2 ?? partida.jogador2,
                jogador1Nome: incomingPartida.jogador1Nome ?? partida.jogador1Nome,
                jogador2Nome: incomingPartida.jogador2Nome ?? partida.jogador2Nome,
            };
        }));

        return updated;
    }, []);

    const upsertPartidaState = useCallback((incomingPartida) => {
        if (!incomingPartida?.id) return false;

        let inserted = false;

        setPartidas((prev) => {
            const existingIndex = prev.findIndex(
                (partida) => normalizeId(partida?.id) === normalizeId(incomingPartida.id)
            );

            if (existingIndex >= 0) {
                return prev.map((partida, index) => {
                    if (index !== existingIndex) return partida;

                    return {
                        ...partida,
                        ...incomingPartida,
                        jogador1: incomingPartida.jogador1 ?? partida.jogador1,
                        jogador2: incomingPartida.jogador2 ?? partida.jogador2,
                        jogador1Nome: incomingPartida.jogador1Nome ?? partida.jogador1Nome,
                        jogador2Nome: incomingPartida.jogador2Nome ?? partida.jogador2Nome,
                    };
                });
            }

            inserted = true;
            return [...prev, incomingPartida];
        });

        return inserted;
    }, []);

    useEffect(() => {
        if (tournamentQuery.data) {
            setTorneio(tournamentQuery.data);
            setPartidas(tournamentQuery.data.partidas || tournamentQuery.data.rodadaAtualPartidas || []);
        }
    }, [tournamentQuery.data]);

    useEffect(() => {
        if (!standingsQuery.data) return;
        const data = standingsQuery.data;
        setStandings(normalizeStandingsPayload(data));
        if (data.partidas || data.rodadaAtualPartidas) {
            setPartidas(data.partidas || data.rodadaAtualPartidas || []);
        }
        setTorneio((prev) => {
            const patch = {};
            if (data.nome || data.torneioNome) Object.assign(patch, data);
            if (data.rodadaIniciadaEm !== undefined) patch.rodadaIniciadaEm = data.rodadaIniciadaEm;
            if (data.rodadaAtual !== undefined) patch.rodadaAtual = data.rodadaAtual;
            if (data.status !== undefined) patch.status = data.status;
            if (data.totalInscritos !== undefined) patch.totalInscritos = data.totalInscritos;
            if (!Object.keys(patch).length) return prev;
            return prev ? { ...prev, ...patch } : patch;
        });
    }, [standingsQuery.data]);

    useEffect(() => {
        if (!matchesQuery.data) return;
        const partidasList = normalizeMatchesPayload(matchesQuery.data);
        if (Array.isArray(partidasList) && partidasList.length > 0) {
            setPartidas(partidasList);
        }
    }, [matchesQuery.data]);

    useEffect(() => {
        if (teamsQuery.data) setTimes(teamsQuery.data);
    }, [teamsQuery.data]);

    useEffect(() => {
        if (!torneioId || !token) {
            setLoading(false);
            return;
        }
        setLoading(tournamentQuery.isLoading || standingsQuery.isLoading || matchesQuery.isLoading);
    }, [torneioId, token, tournamentQuery.isLoading, standingsQuery.isLoading, matchesQuery.isLoading]);

    const loadTournament = useCallback(async () => {
        if (!torneioId || !token) return;
        setError("");
        try {
            const { data } = await tournamentQuery.refetch();
            if (!data) return;
            setTorneio(data);
            setPartidas(data.partidas || data.rodadaAtualPartidas || []);
        } catch {
            setError("Erro ao carregar dados do torneio.");
        }
    }, [torneioId, token, tournamentQuery]);

    const loadPartidas = useCallback(async () => {
        if (!torneioId || !token) return;

        try {
            const { data } = await matchesQuery.refetch();
            const partidasList = normalizeMatchesPayload(data);

            if (Array.isArray(partidasList) && partidasList.length > 0) {
                setPartidas(partidasList);
            }
        } catch {
            // Fallback: manter partidas carregadas por buscarTorneio/standings.
        }
    }, [torneioId, token, matchesQuery]);

    const loadStandings = useCallback(async () => {
        if (!torneioId || !token) return;
        try {
            const { data } = await standingsQuery.refetch();
            if (!data) return;
            setStandings(normalizeStandingsPayload(data));
            if (data.partidas || data.rodadaAtualPartidas) {
                setPartidas(data.partidas || data.rodadaAtualPartidas || []);
            }
            // Merge tournament-level fields returned alongside standings
            setTorneio((prev) => {
                const patch = {};
                if (data.nome || data.torneioNome) Object.assign(patch, data);
                if (data.rodadaIniciadaEm !== undefined) patch.rodadaIniciadaEm = data.rodadaIniciadaEm;
                if (data.rodadaAtual !== undefined) patch.rodadaAtual = data.rodadaAtual;
                if (data.status !== undefined) patch.status = data.status;
                if (data.totalInscritos !== undefined) patch.totalInscritos = data.totalInscritos;
                if (!Object.keys(patch).length) return prev;
                return prev ? { ...prev, ...patch } : patch;
            });
        } catch {
            // Mantem o estado atual se a revalidacao falhar.
        }
    }, [torneioId, token, standingsQuery]);

    // Initial load — wait for all three before hiding skeleton
    // Ably realtime subscriptions
    useEffect(() => {
        if (!torneioId) return;
        const channel = subscribeToTournament(torneioId, {
            onRodadaIniciada: (msg) => {
                const data = msg?.data || {};
                if (data.emCorte) {
                    setTorneio((prev) => prev ? { ...prev, emCorte: true } : prev);
                }
                setCheckinRodadaAberto(false);
                loadTournament();
                loadStandings();
                loadPartidas();
                const somUrl = data.somRodada || somRodadaRef.current;
                if (somUrl) {
                    try {
                        const audio = new Audio(somUrl);
                        audio.volume = 0.7;
                        audio.play().catch(() => { /* autoplay blocked */ });
                    } catch { /* ignore audio errors */ }
                }
            },
            onResultadoRegistrado: (msg) => {
                const partidaAtualizada = msg?.data?.partida || msg?.data;
                const updated = mergePartidaState(partidaAtualizada);
                if (!updated) loadPartidas();
                loadStandings();
            },
            onResultadoContestado: (msg) => {
                const partidaContestada = msg?.data?.partida || msg?.data;
                const updated = mergePartidaState({
                    id: partidaContestada?.id,
                    ...partidaContestada,
                    status: "pendente",
                    vitoriasJogador1: 0,
                    vitoriasJogador2: 0,
                });
                if (!updated) loadPartidas();
                loadStandings();
            },
            onStandingsAtualizados: () => loadStandings(),
            onTorneioFinalizado: () => {
                setTorneio((prev) => (prev ? { ...prev, status: "finalizado" } : prev));
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
                // Reload full tournament to pick up any updated totalRodadas from the backend
                loadTournament();
            },
            onCheckinRealizado: (msg) => {
                const usuarioId = msg.data.usuario?.id || msg.data.usuarioId;
                const checkinRodada = msg.data.checkinRodada ?? msg.data.checkInRodada ?? 0;
                setStandings((prev) =>
                    prev.map((p) =>
                        p.usuario?.id === usuarioId || p.usuarioId === usuarioId || p.id === usuarioId
                            ? { ...p, checkinRodada }
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
            onTorneioIniciado: (msg) => {
                const data = msg?.data || {};
                setTorneio((prev) => prev ? {
                    ...prev,
                    status: data.status || "em_andamento",
                    totalRodadas: data.totalRodadas ?? prev.totalRodadas,
                    totalPartidas: data.totalPartidas ?? prev.totalPartidas,
                } : prev);
                loadTournament();
                loadStandings();
                loadPartidas();
            },
            onJogadorDropou: (msg) => {
                const data = msg?.data || {};
                const { jogadorId, jogadorNome, partidasResolvidas, inscricaoRemovida } = data;
                setStandings((prev) => prev.map((p) => {
                    const pId = normalizeId(p.usuario?.id || p.usuarioId || p.id);
                    if (pId !== normalizeId(jogadorId)) return p;
                    return { ...p, dropped: true };
                }).filter((p) => {
                    if (!inscricaoRemovida) return true;
                    return normalizeId(p.usuario?.id || p.usuarioId || p.id) !== normalizeId(jogadorId);
                }));
                if (inscricaoRemovida) {
                    setTorneio((prev) => prev ? { ...prev, totalInscritos: Math.max(0, Number(prev.totalInscritos || 0) - 1) } : prev);
                }
                if (Array.isArray(partidasResolvidas)) {
                    partidasResolvidas.forEach(({ partidaId, vencedorId }) => {
                        setPartidas((prev) => prev.map((p) => {
                            if (normalizeId(p.id) !== normalizeId(partidaId)) return p;
                            const isJ1 = normalizeId(p.jogador1Id || p.jogador1?.id) === normalizeId(vencedorId);
                            return { ...p, status: "finalizada", vitoriasJogador1: isJ1 ? 2 : 0, vitoriasJogador2: isJ1 ? 0 : 2 };
                        }));
                    });
                }
                showToast(`${jogadorNome || "Jogador"} saiu do torneio.`, "warning");
                loadStandings();
            },
            onResultadoAjustado: (msg) => {
                const data = msg?.data || {};
                mergePartidaState({
                    id: data.partidaId,
                    rodada: data.rodada,
                    vitoriasJogador1: data.vitoriasJogador1,
                    vitoriasJogador2: data.vitoriasJogador2,
                    contestado: false,
                    status: "finalizada",
                });
                loadStandings();
                showToast("Resultado da partida foi ajustado pelo admin.", "info");
            },
            onCorteIniciado: (msg) => {
                const data = msg?.data || {};
                setCorteInfo({ corteTop: data.corteTop, jogadoresClassificados: data.jogadoresClassificados || [] });
                setTorneio((prev) => prev ? { ...prev, emCorte: true, rodadaAtual: data.rodadaAtual ?? prev.rodadaAtual } : prev);
                loadTournament();
                loadStandings();
                loadPartidas();
            },
            onJogadorIngressou: (msg) => {
                const data = msg?.data || {};
                const {
                    usuarioId: uid,
                    usuarioNome,
                    partida,
                    match,
                    novaPartida,
                    partidaPenalidade,
                } = data;
                const partidaIngressoTardio =
                    partidaPenalidade ||
                    novaPartida ||
                    partida ||
                    match ||
                    null;

                setStandings((prev) => {
                    const jaExiste = prev.some((p) => normalizeId(p.usuario?.id || p.usuarioId || p.id) === normalizeId(uid));
                    if (jaExiste) return prev;
                    return [...prev, { usuario: { id: uid, nome: usuarioNome }, id: uid, usuarioId: uid, nome: usuarioNome, pontos: 0 }];
                });
                setTorneio((prev) => prev ? { ...prev, totalInscritos: (prev.totalInscritos || 0) + 1 } : prev);
                if (partidaIngressoTardio?.id) {
                    upsertPartidaState(partidaIngressoTardio);
                } else {
                    loadPartidas();
                }
                const recebeuByePenalidade =
                    partidaIngressoTardio?.tipoBye === "penalidade" &&
                    !partidaIngressoTardio?.jogador2Id &&
                    !partidaIngressoTardio?.jogador2;
                const toastMsg = recebeuByePenalidade
                    ? `${usuarioNome || "Jogador"} entrou no torneio e recebeu bye por penalidade.`
                    : `${usuarioNome || "Jogador"} entrou no torneio.`;
                showToast(toastMsg, "success");
            },
            onTotalRodadasAlterado: (msg) => {
                const data = msg?.data || {};
                setTorneio((prev) => prev ? { ...prev, totalRodadas: data.totalRodadas } : prev);
                showToast(`Torneio estendido para ${data.totalRodadas} rodadas (ingresso tardio).`, "info");
            },
            onCheckinRodadaAberto: () => {
                setCheckinRodadaAberto(true);
            },
            onRodadaRefeita: (msg) => {
                const data = msg?.data || {};
                setTorneio((prev) => prev ? {
                    ...prev,
                    rodadaAtual: data.rodadaAtual ?? prev.rodadaAtual,
                    totalRodadas: data.totalRodadas ?? prev.totalRodadas,
                    emCorte: data.emCorte ?? prev.emCorte,
                    rodadaIniciadaEm: undefined,
                } : prev);
                loadTournament();
                loadStandings();
                loadPartidas();
                showToast(`Rodada ${data.rodadaRemovida || "atual"} removida. Torneio voltou para a rodada ${data.rodadaAtual || "anterior"}.`, "warning");
            },
        });
        return () => {
            if (channel) unsubscribeFromTournament(channel);
        };
    }, [torneioId, loadTournament, loadStandings, loadPartidas, mergePartidaState, showToast, upsertPartidaState]);

    const dismissCorteInfo = useCallback(() => setCorteInfo(null), []);
    const dismissCheckinBanner = useCallback(() => setCheckinRodadaAberto(false), []);

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

    const canManageTournament = useMemo(
        () => isOwner || isAdmin,
        [isOwner, isAdmin],
    );

    const pendingCheckinPlayers = useMemo(() => {
        if (!shouldRequestNextRoundCheckin(torneio)) return [];
        const rodadaAtual = torneio?.rodadaAtual ?? 0;

        return (standings || []).filter((player) => !player?.dropped && !isCheckedForNextRound(player, rodadaAtual));
    }, [standings, torneio]);

    const requiresNextRoundCheckin = useMemo(
        () => shouldRequestNextRoundCheckin(torneio),
        [torneio],
    );

    const nextRoundAction = useMemo(
        () => getTournamentNextAction(torneio),
        [torneio],
    );

    const nextRoundActionLabels = useMemo(
        () => getNextRoundActionLabels(torneio, pendingCheckinPlayers.length),
        [torneio, pendingCheckinPlayers.length],
    );

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
            const status = err?.response?.status || err?.status;
            if (status === 400) {
                const selectedDeck = decks.find((d) => String(d.id) === String(selectedDeckId));
                const deckFormato = selectedDeck?.formato;
                const torneioFormato = torneio?.formato;
                if (deckFormato && torneioFormato && deckFormato.toLowerCase() !== torneioFormato.toLowerCase()) {
                    setError(
                        `O deck selecionado é de formato ${deckFormato.charAt(0).toUpperCase() + deckFormato.slice(1)}, mas o torneio é ${torneioFormato.charAt(0).toUpperCase() + torneioFormato.slice(1)}. Escolha um deck compatível.`
                    );
                } else {
                    setError(err.message || "Deck inválido para este torneio.");
                }
            } else {
                setError(err.message || "Erro ao escolher deck.");
            }
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

        // Proactive check: require nickMTGO before attempting API call
        if (!usuario?.nickMTGO) {
            setError("É necessário configurar um nick do MTGO no seu perfil antes de se inscrever. Acesse seu perfil pelo menu superior.");
            clearMessages();
            return;
        }

        setActionLoading(true);
        setError("");
        try {
            const payload = selectedTimeId ? { timeId: selectedTimeId } : {};
            await inscreverTorneio(torneioId, token, payload);
            setSuccessMsg("Inscrição realizada com sucesso!");
            await loadTournament();
            await loadStandings();
            clearMessages();
        } catch (err) {
            const isNickError = err.message?.toLowerCase().includes("nick") || err.message?.toLowerCase().includes("mtgo");
            if (isNickError) {
                setError(err.message + " Acesse seu perfil pelo menu superior para configurar.");
            } else {
                setError(err.message || "Erro ao se inscrever.");
            }
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

    const handleInscreverTarde = async () => {
        if (!torneioId) return;
        if (!usuario?.nickMTGO) {
            setError("É necessário configurar um nick do MTGO no seu perfil antes de se inscrever.");
            clearMessages();
            return;
        }
        setActionLoading(true);
        setError("");
        try {
            const payload = selectedTimeId ? { timeId: selectedTimeId } : {};
            await inscreverTardio(torneioId, token, payload);
            setSuccessMsg("Inscrição tardia realizada! Você recebeu um bye nesta rodada.");
            await loadTournament();
            await loadStandings();
            clearMessages();
        } catch (err) {
            setError(err.message || "Erro ao realizar inscrição tardia.");
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
            const data = await registrarResultado(partidaId, resultado, token);
            const updated = mergePartidaState({
                id: partidaId,
                ...(data?.partida || data),
                status: "finalizada",
                ...resultado,
            });
            setSuccessMsg("Resultado registrado!");
            await loadStandings();
            if (!updated) {
                await loadPartidas();
            }
            clearMessages();
        } catch (err) {
            setError(err.message || "Erro ao registrar resultado.");
            clearMessages();
        } finally {
            setActionLoading(false);
        }
    };

    const handleContestResult = async (partidaId) => {
        if (!partidaId) return;
        setActionLoading(true);
        setError("");
        try {
            const data = await contestarResultado(partidaId, token);
            const updated = mergePartidaState({
                id: partidaId,
                ...(data?.partida || data),
                status: "pendente",
                contestado: true,
                vitoriasJogador1: 0,
                vitoriasJogador2: 0,
            });
            setSuccessMsg("Resultado contestado!");
            await loadStandings();
            if (!updated) {
                await loadPartidas();
            }
            clearMessages();
        } catch (err) {
            setError(err.message || "Erro ao contestar resultado.");
            clearMessages();
        } finally {
            setActionLoading(false);
        }
    };

    const handleConfirmResult = async (partidaId) => {
        if (!partidaId) return;
        setActionLoading(true);
        setError("");
        try {
            const data = await confirmarResultadoPartida(partidaId, token);
            const updated = mergePartidaState({
                id: partidaId,
                ...(data?.partida || data),
            });
            setSuccessMsg("Resultado confirmado!");
            if (!updated) await loadPartidas();
            clearMessages();
        } catch (err) {
            setError(err.message || "Erro ao confirmar resultado.");
            clearMessages();
        } finally {
            setActionLoading(false);
        }
    };

    const handleAdjustResult = async (partidaId, resultado) => {
        if (!partidaId) return;
        setActionLoading(true);
        setError("");
        try {
            const data = await ajustarResultado(partidaId, resultado, token);
            const updated = mergePartidaState({
                id: partidaId,
                ...(data?.partida || data),
                status: "finalizada",
                contestado: false,
                ...resultado,
            });
            setSuccessMsg("Resultado ajustado com sucesso!");
            await loadStandings();
            if (!updated) {
                await loadPartidas();
            }
            clearMessages();
        } catch (err) {
            setError(err.message || "Erro ao ajustar resultado.");
            clearMessages();
        } finally {
            setActionLoading(false);
        }
    };

    const handleGerarLinkIngresso = async () => {
        if (!torneioId) return null;
        try {
            const data = await gerarLinkIngresso(torneioId, token);
            return data;
        } catch (err) {
            setError(err.message || "Erro ao gerar link de ingresso.");
            clearMessages();
            return null;
        }
    };

    const enforceNextRoundCheckin = false;

    const handleNextRound = async () => {
        if (!torneioId || !canManageTournament) return;
        if (enforceNextRoundCheckin && requiresNextRoundCheckin && pendingCheckinPlayers.length > 0) {
            const total = pendingCheckinPlayers.length;
            setError(
                `Não é possível iniciar a próxima rodada: faltam ${total} jogador(es) fazer check-in da próxima rodada.`,
            );
            clearMessages();
            return;
        }
        setActionLoading(true);
        setAdminActionKey("next-round");
        setError("");
        try {
            const actionBeforeRequest = nextRoundAction;
            const data = await proximaRodada(torneioId, token);
            if (data?.finalizado) {
                setTorneio((prev) => (prev ? { ...prev, ...data, status: "finalizado" } : { ...data, status: "finalizado" }));
                setSuccessMsg("Torneio finalizado com sucesso!");
            } else if (actionBeforeRequest === "start-top-cut") {
                setSuccessMsg("Corte iniciado com sucesso!");
            } else if (actionBeforeRequest === "advance-top-cut") {
                setSuccessMsg("Fase eliminatória avançada com sucesso!");
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
            setAdminActionKey("");
        }
    };

    const handleRefazerRodada = async () => {
        if (!torneioId || !canManageTournament) return false;
        setActionLoading(true);
        setAdminActionKey("redo-round");
        setError("");
        try {
            const data = await refazerRodada(torneioId, token);
            setTorneio((prev) => prev ? {
                ...prev,
                rodadaAtual: data?.rodadaAtual ?? prev.rodadaAtual,
                totalRodadas: data?.totalRodadas ?? prev.totalRodadas,
                emCorte: data?.emCorte ?? prev.emCorte,
                rodadaIniciadaEm: undefined,
            } : prev);
            setSuccessMsg(`Rodada ${data?.rodadaRemovida || "atual"} removida. Ajuste a rodada ${data?.rodadaAtual || "anterior"} e avance novamente quando estiver pronto.`);
            await loadTournament();
            await loadStandings();
            await loadPartidas();
            clearMessages();
            return true;
        } catch (err) {
            setError(err.message || "Erro ao refazer rodada.");
            clearMessages();
            return false;
        } finally {
            setActionLoading(false);
            setAdminActionKey("");
        }
    };

    const handleStartTournament = async () => {
        if (!torneioId || !canManageTournament) return;

        setActionLoading(true);
        setAdminActionKey("start-tournament");
        setError("");
        try {
            await iniciarTorneio(torneioId, token);
            setSuccessMsg("Torneio iniciado com sucesso!");
            await loadTournament();
            await loadStandings();
            await loadPartidas();
            clearMessages();
            return true;
        } catch (err) {
            setError(err.message || "Erro ao iniciar torneio.");
            clearMessages();
            return false;
        } finally {
            setActionLoading(false);
            setAdminActionKey("");
        }
    };

    const handleBulkDropPlayers = async (playerIds, options = {}) => {
        if (!torneioId || !canManageTournament) return false;

        const uniquePlayerIds = [...new Set(
            (playerIds || [])
                .map((playerId) => normalizeId(playerId))
                .filter(Boolean),
        )];

        if (uniquePlayerIds.length === 0) {
            return false;
        }

        const {
            actionKey = "bulk-drop",
            successMessage = "Jogadores dropados com sucesso!",
            errorMessage = "Erro ao dropar jogadores.",
        } = options;

        setActionLoading(true);
        setAdminActionKey(actionKey);
        setDroppingPlayerId("__bulk__");
        setError("");

        try {
            const results = await Promise.allSettled(
                uniquePlayerIds.map((playerId) => dropJogador(torneioId, playerId, token)),
            );

            const failedResults = results.filter((result) => result.status === "rejected");

            await loadTournament();
            await loadStandings();
            await loadPartidas();

            if (failedResults.length === uniquePlayerIds.length) {
                throw failedResults[0]?.reason || new Error(errorMessage);
            }

            if (failedResults.length > 0) {
                setError(`${failedResults.length} de ${uniquePlayerIds.length} drop(s) falharam.`);
            } else {
                setSuccessMsg(successMessage);
            }

            clearMessages();
            return failedResults.length === 0;
        } catch (err) {
            setError(err.message || errorMessage);
            clearMessages();
            return false;
        } finally {
            setActionLoading(false);
            setAdminActionKey("");
            setDroppingPlayerId("");
        }
    };

    const handleDropPlayer = async (jogadorId) => {
        if (!torneioId || !canManageTournament || !jogadorId) return;
        setActionLoading(true);
        setAdminActionKey("drop-player");
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
            setAdminActionKey("");
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
        adminActionKey,
        error,
        successMsg,
        isOwner,
        canManageTournament,
        pendingCheckinPlayers,
        requiresNextRoundCheckin,
        nextRoundAction,
        nextRoundActionLabels,
        currentPlayer,
        myMatch,
        decks,
        selectedDeckId,
        setSelectedDeckId,
        handleChooseDeck: guard(handleChooseDeck),
        handleCheckin: guard(handleCheckin),
        handleInscrever: guard(handleInscrever),
        handleInscreverTarde: guard(handleInscreverTarde),
        times,
        selectedTimeId,
        setSelectedTimeId,
        handleReportResult: guard(handleReportResult),
        handleContestResult: guard(handleContestResult),
        handleConfirmResult: guard(handleConfirmResult),
        handleAdjustResult: guard(handleAdjustResult),
        handleGerarLinkIngresso,
        handleStartTournament: guard(handleStartTournament),
        handleNextRound: guard(handleNextRound),
        handleRefazerRodada: guard(handleRefazerRodada),
        handleBulkDropPlayers: guard(handleBulkDropPlayers),
        handleDropPlayer: guard(handleDropPlayer),
        handleEditTorneio: guard(handleEditTorneio),
        handleDeleteTorneio: guard(handleDeleteTorneio),
        loadPartidas,
        realtimeToast,
        corteInfo,
        dismissCorteInfo,
        checkinRodadaAberto,
        dismissCheckinBanner,
        usuario,
        isAdmin,
        token,
    };
}

