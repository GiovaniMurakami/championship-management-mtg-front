import { useMemo, useState, Fragment } from "react";
import { normalizeId } from "../../utils/normalizeId";
import { getMatchConfirmationSummary, hasPlayerConfirmedResult } from "../../utils/matchConfirmations";
import { getDisplaySides, getMatchPlayerName } from "../../utils/matchDisplay";
import { UsuarioNomeExibicao } from "../ui/UsuarioExcluidoTag";
import { formatTournamentRoundLabel, isEliminationPhase } from "../../utils/tournamentFlow";
import { editarPareamentosRodada } from "../../services/backendApi";
import { SelectField } from "../ui";
import { ConfirmationIcon, ConfirmationSummaryIcon } from "./ConfirmationIcon";

function getMesa(partida, index) {
    return partida.mesa ?? partida.mesaNumero ?? partida.numeroMesa ?? index + 1;
}

function getMesaSortValue(partida) {
    const mesa = Number(partida?.mesa ?? partida?.mesaNumero ?? partida?.numeroMesa);
    return Number.isFinite(mesa) ? mesa : Number.MAX_SAFE_INTEGER;
}

function sortByMesa(a, b) {
    const mesaDiff = getMesaSortValue(a) - getMesaSortValue(b);
    if (mesaDiff !== 0) return mesaDiff;
    return Number(a?.rodada ?? 0) - Number(b?.rodada ?? 0);
}

function isUserMatch(partida, usuarioId) {
    if (!usuarioId) return false;
    const uid = normalizeId(usuarioId);
    return (
        normalizeId(partida.jogador1Id || partida.jogador1?.id) === uid ||
        normalizeId(partida.jogador2Id || partida.jogador2?.id) === uid
    );
}

function MatchCard({ partida, index, usuarioId }) {
    const isFinalizada = partida.status === "finalizada";
    const isBye = !partida.jogador2Id && !partida.jogador2;
    const isMe = isUserMatch(partida, usuarioId);
    const confirmation = getMatchConfirmationSummary(partida);
    const player1Confirmed = hasPlayerConfirmedResult(partida, 1);
    const player2Confirmed = hasPlayerConfirmedResult(partida, 2);

    const sides = getDisplaySides(partida, usuarioId);
    const p1 = sides.left;
    const p2 = isBye ? { name: "BYE", isMe: false } : sides.right;

    const score = isFinalizada
        ? `${partida.vitoriasJogador1 ?? 0} – ${partida.vitoriasJogador2 ?? 0}`
        : "VS";

    return (
        <article className={`min-w-0 max-w-full overflow-visible rounded-[10px] px-[0.85rem] pt-[0.7rem] pb-[0.8rem] transition-[border-color,background] duration-200 ${isMe ? "border border-[rgba(167,79,255,0.5)] bg-[rgba(167,79,255,0.07)] hover:border-[rgba(167,79,255,0.7)] hover:bg-[rgba(167,79,255,0.1)]" : "border border-[rgba(56,189,248,0.15)] bg-[rgba(255,255,255,0.03)] hover:border-[rgba(56,189,248,0.3)] hover:bg-[rgba(56,189,248,0.04)]"} ${isFinalizada ? "opacity-[0.82]" : ""}`}>
            <div className="flex items-start justify-between gap-2 mb-[0.55rem] flex-wrap max-md:flex-col max-md:items-start">
                <div className="flex items-center gap-[0.4rem] min-w-0">
                    <span className="text-[0.72rem] font-bold text-[#7dd3fc] tracking-[0.04em] uppercase">Mesa {getMesa(partida, index)}</span>
                </div>
                <div className="flex items-center gap-[0.4rem] flex-wrap max-md:w-full">
                    {partida.contestado && (
                        <span className="text-[0.65rem] font-bold tracking-[0.05em] uppercase px-[0.55rem] py-[0.15rem] rounded-full bg-[rgba(239,68,68,0.15)] border border-[rgba(239,68,68,0.4)] text-[#f87171]">
                            Contestado
                        </span>
                    )}
                    <span className={`text-[0.68rem] font-bold tracking-[0.05em] uppercase px-2 py-[0.15rem] rounded-full ${isFinalizada ? "bg-[rgba(34,197,94,0.12)] border border-[rgba(34,197,94,0.35)] text-[#86efac]" : "bg-[rgba(250,204,21,0.12)] border border-[rgba(250,204,21,0.35)] text-[#fde047]"}`}>
                        {isFinalizada ? "Finalizada" : "Pendente"}
                    </span>
                    {isFinalizada && !isBye && (
                        <ConfirmationSummaryIcon confirmation={confirmation} />
                    )}
                </div>
            </div>

            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-[0.4rem] max-md:grid-cols-1 max-md:gap-2">
                <div className={`flex flex-col gap-[0.15rem] min-w-0 items-start max-md:items-center max-md:text-center ${p1.isMe ? "[&_.mtp-player-name]:text-[#c4b5fd]" : ""}`}>
                    <span className={`text-[0.86rem] font-semibold max-w-full truncate max-md:whitespace-normal max-md:break-words max-md:overflow-visible ${p1.isMe ? "text-[#c4b5fd]" : "text-[#e2e8f0]"}`}>
                        <UsuarioNomeExibicao nome={p1.name} excluido={p1.excluido} />
                    </span>
                    {p1.isMe && <span className="text-[0.55rem] font-black text-[#c4b5fd] bg-[rgba(167,79,255,0.14)] rounded-full px-[0.28rem] py-0 leading-[1.25] tracking-[0.04em]">VOCÊ</span>}
                    {isFinalizada && !isBye && (
                        <ConfirmationIcon confirmed={player1Confirmed} label={`${p1.name}: ${player1Confirmed ? "confirmou" : "falta confirmar"}`} />
                    )}
                </div>

                <span className={`text-[0.88rem] font-extrabold tracking-[0.04em] text-center px-2 py-[0.2rem] rounded-[6px] flex-shrink-0 max-md:mx-auto ${isFinalizada ? "text-white bg-[rgba(56,189,248,0.15)] border border-[rgba(56,189,248,0.3)]" : "text-[rgba(199,149,255,0.7)] bg-[rgba(167,79,255,0.1)] border border-[rgba(167,79,255,0.2)]"}`}>
                    {score}
                </span>

                <div className={`flex flex-col gap-[0.15rem] min-w-0 items-end text-right max-md:items-center max-md:text-center ${p2.isMe ? "" : ""} ${isBye ? "" : ""}`}>
                    {p2.isMe && <span className="text-[0.55rem] font-black text-[#c4b5fd] bg-[rgba(167,79,255,0.14)] rounded-full px-[0.28rem] py-0 leading-[1.25] tracking-[0.04em]">VOCÊ</span>}
                    <span className={`text-[0.86rem] font-semibold max-w-full truncate max-md:whitespace-normal max-md:break-words max-md:overflow-visible ${p2.isMe ? "text-[#c4b5fd]" : isBye ? "text-[rgba(226,232,240,0.4)] italic" : "text-[#e2e8f0]"}`}>
                        {isBye ? p2.name : <UsuarioNomeExibicao nome={p2.name} excluido={p2.excluido} />}
                    </span>
                    {isFinalizada && !isBye && (
                        <ConfirmationIcon confirmed={player2Confirmed} label={`${p2.name}: ${player2Confirmed ? "confirmou" : "falta confirmar"}`} />
                    )}
                </div>
            </div>

        </article>
    );
}

export function MatchTablesPanel({ torneio, partidas, standings = [], usuarioId, isOwner, token, onPartidasUpdate }) {
    const isOngoing = torneio?.status === "em_andamento";
    const isFinished = torneio?.status === "finalizado";
    const isTopCut = isEliminationPhase(torneio);
    const corteTop = Number(torneio?.corteTop || 0);

    const rodadaAtual = Number(torneio?.rodadaAtual || 0);

    const roundNumbers = useMemo(() => {
        const rounds = (partidas || [])
            .map((p) => Number(p?.rodada))
            .filter((r) => Number.isFinite(r) && r > 0);
        return Array.from(new Set(rounds)).sort((a, b) => a - b);
    }, [partidas]);

    const defaultRound = isFinished
        ? roundNumbers[roundNumbers.length - 1] ?? 1
        : rodadaAtual || 1;

    const [selectedRoundOverride, setSelectedRoundOverride] = useState(null);

    const selectedRound = useMemo(() => {
        const normalizedOverride = Number(selectedRoundOverride);
        if (Number.isFinite(normalizedOverride) && roundNumbers.includes(normalizedOverride)) {
            return normalizedOverride;
        }
        return defaultRound;
    }, [defaultRound, roundNumbers, selectedRoundOverride]);

    const partidasRodada = useMemo(() =>
        (partidas || []).filter((p) => {
            if (!p) return false;
            if (!selectedRound || p.rodada == null) return true;
            return Number(p.rodada) === Number(selectedRound);
        }).sort(sortByMesa),
        [partidas, selectedRound]
    );

    const finalizadas = partidasRodada.filter((p) => p.status === "finalizada").length;
    const total = partidasRodada.length;
    const progressPct = total > 0 ? Math.round((finalizadas / total) * 100) : 0;
    const allDone = total > 0 && finalizadas === total;

    const showRoundPicker = roundNumbers.length > 1;

    const [searchQuery, setSearchQuery] = useState("");
    const [showPendingOnly, setShowPendingOnly] = useState(false);
    const [pairingsOpen, setPairingsOpen] = useState(false);
    const [pairingsLoading, setPairingsLoading] = useState(false);
    const [pairingsError, setPairingsError] = useState("");
    const [pairingsDraft, setPairingsDraft] = useState([]);

    const tournamentPlayers = useMemo(() => {
        const map = new Map();
        (standings || []).forEach((row) => {
            if (row?.dropped) return;
            const id = row.usuario?.id || row.usuarioId || row.id;
            const nome = row.usuario?.nome || row.nome || id;
            if (id) map.set(normalizeId(id), { id, nome });
        });
        // Garante jogadores já pareados mesmo se sumirem do standing filtrado.
        partidasRodada.forEach((partida) => {
            const jogador1Id = partida.jogador1Id || partida.jogador1?.id;
            const jogador2Id = partida.jogador2Id || partida.jogador2?.id;
            if (jogador1Id && !map.has(normalizeId(jogador1Id))) {
                map.set(normalizeId(jogador1Id), { id: jogador1Id, nome: getMatchPlayerName(partida, 1) });
            }
            if (jogador2Id && !map.has(normalizeId(jogador2Id))) {
                map.set(normalizeId(jogador2Id), { id: jogador2Id, nome: getMatchPlayerName(partida, 2) });
            }
        });
        return Array.from(map.values()).sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    }, [standings, partidasRodada]);

    const assignedPlayerIds = useMemo(() => {
        const set = new Set();
        pairingsDraft.forEach((partida) => {
            if (partida.jogador1Id) set.add(normalizeId(partida.jogador1Id));
            if (partida.jogador2Id) set.add(normalizeId(partida.jogador2Id));
        });
        return set;
    }, [pairingsDraft]);

    const conflictPlayerIds = useMemo(() => {
        const counts = new Map();
        pairingsDraft.forEach((partida) => {
            [partida.jogador1Id, partida.jogador2Id].filter(Boolean).forEach((id) => {
                const key = normalizeId(id);
                counts.set(key, (counts.get(key) || 0) + 1);
            });
        });
        return new Set(Array.from(counts.entries()).filter(([, n]) => n > 1).map(([id]) => id));
    }, [pairingsDraft]);

    const unassignedPlayers = useMemo(
        () => tournamentPlayers.filter((player) => !assignedPlayerIds.has(normalizeId(player.id))),
        [tournamentPlayers, assignedPlayerIds]
    );

    const byeCount = useMemo(
        () => pairingsDraft.filter((partida) => !partida.jogador2Id).length,
        [pairingsDraft]
    );

    const handleOpenPairingsEditor = () => {
        setPairingsError("");
        setPairingsDraft(
            partidasRodada.map((partida, index) => ({
                id: partida.id,
                clientKey: partida.id || `row-${index}`,
                locked: partida.status === "finalizada",
                jogador1Id: partida.jogador1Id || partida.jogador1?.id || "",
                jogador2Id: partida.jogador2Id || partida.jogador2?.id || "",
                mesa: String(getMesa(partida, index)),
            }))
        );
        setPairingsOpen(true);
    };

    const handlePairingChange = (index, field, value) => {
        setPairingsDraft((prev) => prev.map((item, itemIndex) => {
            if (itemIndex !== index) return item;
            if (item.locked && field !== "mesa") return item;
            return { ...item, [field]: value };
        }));
    };

    const handleAddTable = (asBye = false) => {
        const nextMesa = Math.max(0, ...pairingsDraft.map((p) => Number(p.mesa) || 0)) + 1;
        setPairingsDraft((prev) => [
            ...prev,
            {
                id: null,
                clientKey: `new-${Date.now()}-${prev.length}`,
                locked: false,
                jogador1Id: "",
                jogador2Id: asBye ? "" : "",
                mesa: String(nextMesa),
            },
        ]);
    };

    const handleRemoveTable = (index) => {
        setPairingsDraft((prev) => prev.filter((item, itemIndex) => itemIndex !== index || item.locked));
    };

    const handleSavePairings = async () => {
        if (!token || !torneio?.id || !selectedRound) return;

        const incomplete = pairingsDraft.some((partida) => !partida.jogador1Id);
        if (incomplete) {
            setPairingsError("Todas as mesas precisam de jogador 1.");
            return;
        }
        if (conflictPlayerIds.size > 0) {
            setPairingsError("Há jogadores em mais de uma mesa.");
            return;
        }
        if (byeCount > 1) {
            setPairingsError("A rodada pode ter no máximo um BYE.");
            return;
        }

        setPairingsLoading(true);
        setPairingsError("");
        try {
            await editarPareamentosRodada(
                torneio.id,
                selectedRound,
                {
                    partidas: pairingsDraft.map((partida) => ({
                        ...(partida.id ? { id: partida.id } : {}),
                        jogador1Id: partida.jogador1Id,
                        jogador2Id: partida.jogador2Id || null,
                        mesa: partida.mesa ? Number(partida.mesa) : null,
                    })),
                },
                token
            );
            await onPartidasUpdate?.();
            setPairingsOpen(false);
        } catch (err) {
            setPairingsError(err.message || "Erro ao atualizar os pareamentos.");
        } finally {
            setPairingsLoading(false);
        }
    };

    const filteredAndSortedPartidas = useMemo(() => {
        let result = partidasRodada;
        if (showPendingOnly) {
            result = result.filter(p => p.status !== "finalizada");
        }
        if (searchQuery.trim()) {
            const q = searchQuery.trim().toLowerCase();
            result = result.filter(p => {
                const n1 = (p.jogador1Nome || p.jogador1?.nome || p.jogador1?.username || "").toLowerCase();
                const n2 = (p.jogador2Nome || p.jogador2?.nome || p.jogador2?.username || "").toLowerCase();
                const mesa = String(getMesa(p, 0));
                return n1.includes(q) || n2.includes(q) || mesa.includes(q);
            });
        }
        return result;
    }, [partidasRodada, showPendingOnly, searchQuery]);

    if (!isOngoing && !isFinished) return null;

    return (
        <Fragment>
        <section className="border border-[rgba(56,189,248,0.3)] rounded-2xl p-5 bg-[linear-gradient(160deg,rgba(7,37,49,0.6),rgba(8,20,34,0.9))] shadow-[0_4px_20px_rgba(3,2,8,0.3)] animate-[slide-up_400ms_ease-out] max-md:p-4 max-md:rounded-xl max-w-full min-w-0 overflow-x-clip overflow-hidden">

            <div className="flex items-center justify-between gap-3 flex-wrap mb-[0.9rem] max-md:flex-col max-md:items-stretch">
                <div className="flex items-center gap-[0.65rem] flex-wrap">
                    <h2 className="m-0 font-['Bebas_Neue',sans-serif] text-[1.5rem] tracking-[0.04em] text-[#f5edff]">Mesas</h2>
                    {isOngoing && (
                        <span className="text-[0.75rem] font-semibold text-[#7dd3fc] bg-[rgba(56,189,248,0.1)] border border-[rgba(56,189,248,0.25)] rounded-full px-[0.65rem] py-[0.2rem]">
                            Rodada {formatTournamentRoundLabel(torneio)}
                        </span>
                    )}
                    {isTopCut && (
                        <span className="text-[0.75rem] font-semibold text-[#fef08a] bg-[rgba(250,204,21,0.12)] border border-[rgba(250,204,21,0.35)] rounded-full px-[0.65rem] py-[0.2rem]">
                            Top {corteTop || ""}
                        </span>
                    )}
                </div>

                {showRoundPicker && (
                    <div className="flex items-center gap-[0.3rem] flex-wrap max-md:w-full min-w-0 max-w-full" role="tablist" aria-label="Selecionar rodada">
                        {roundNumbers.map((r) => (
                            <button
                                key={r}
                                type="button"
                                role="tab"
                                aria-selected={Number(selectedRound) === r}
                                className={`border rounded-full px-[0.6rem] py-[0.25rem] min-w-[2.2rem] text-[0.75rem] font-bold cursor-pointer transition-all duration-150 flex-shrink-0 ${Number(selectedRound) === r ? "bg-[rgba(56,189,248,0.22)] border-[rgba(56,189,248,0.7)] text-white" : "border-[rgba(125,211,252,0.3)] bg-[rgba(125,211,252,0.06)] text-[#93c5fd] hover:bg-[rgba(125,211,252,0.16)] hover:border-[rgba(125,211,252,0.5)] hover:text-[#bae6fd]"}`}
                                onClick={() => setSelectedRoundOverride(r)}
                            >
                                R{r}
                            </button>
                        ))}
                    </div>
                )}

                {isOwner && isOngoing && Number(selectedRound) === Number(rodadaAtual) && total > 0 && (
                    <button
                        type="button"
                        className="inline-flex items-center justify-center gap-[0.4rem] px-3 py-[0.45rem] rounded-[0.7rem] border border-[rgba(125,211,252,0.35)] bg-[rgba(56,189,248,0.08)] text-[#7dd3fc] text-[0.8rem] font-semibold cursor-pointer transition-all duration-150 hover:bg-[rgba(56,189,248,0.16)] max-md:w-full"
                        onClick={handleOpenPairingsEditor}
                    >
                        Editar pareamentos
                    </button>
                )}
            </div>

            {isTopCut && total > 0 && (
                <div className="mb-3 rounded-[0.75rem] border border-[rgba(250,204,21,0.22)] bg-[rgba(250,204,21,0.07)] px-3 py-2 text-[0.82rem] font-semibold text-[#fef3c7]">
                    Pareamentos do corte eliminatório visíveis para os jogadores classificados.
                </div>
            )}

            {total > 0 && (
                <div className="flex items-center gap-[0.65rem] mb-3 min-w-0">
                    <div className="flex-1 h-1 bg-[rgba(255,255,255,0.08)] rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-[width] duration-[0.4s] ease-in-out ${allDone ? "bg-[#4ade80]" : "bg-[#38bdf8]"}`}
                            style={{ width: `${progressPct}%` }}
                        />
                    </div>
                    <span className="text-[0.75rem] font-semibold text-[rgba(186,230,253,0.7)] whitespace-nowrap flex-shrink-0">
                        {finalizadas}/{total} finalizada{finalizadas !== 1 ? "s" : ""}
                    </span>
                </div>
            )}

            {total > 3 && (
                <div className="flex items-center gap-2 mb-3 flex-wrap max-md:flex-col max-md:items-stretch">
                    <div className="relative flex-1 min-w-[170px] max-w-[360px] max-md:max-w-none max-md:w-full">
                        <input
                            type="search"
                            placeholder="Buscar jogador ou mesa…"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(56,189,248,0.18)] rounded-[0.6rem] pl-3 pr-[1.8rem] py-[0.38rem] text-[0.83rem] text-[#e2e8f0] placeholder-[rgba(186,230,253,0.35)] focus:outline-none focus:border-[rgba(56,189,248,0.5)] transition-[border-color] duration-150"
                        />
                        <svg className="absolute right-[0.6rem] top-1/2 -translate-y-1/2 text-[rgba(186,230,253,0.4)] pointer-events-none" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowPendingOnly(p => !p)}
                        className={`inline-flex items-center justify-center gap-[0.3rem] px-3 py-[0.38rem] border rounded-[0.6rem] text-[0.8rem] font-semibold cursor-pointer transition-all duration-150 flex-shrink-0 max-md:w-full ${showPendingOnly ? "bg-[rgba(250,204,21,0.18)] border-[rgba(250,204,21,0.6)] text-[#fde047]" : "bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.12)] text-[#beafd7] hover:bg-[rgba(255,255,255,0.08)] hover:text-[#f5edff]"}`}
                    >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                        </svg>
                        Só pendentes
                    </button>
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            className="inline-flex items-center gap-[0.3rem] px-3 py-[0.38rem] border border-[rgba(217,180,255,0.2)] rounded-[0.6rem] text-[0.8rem] text-[#beafd7] cursor-pointer hover:text-[#f5edff] hover:bg-[rgba(255,255,255,0.05)] transition-all duration-150 flex-shrink-0"
                        >
                            ✕ Limpar
                        </button>
                    )}
                </div>
            )}

            {(searchQuery || showPendingOnly) && total > 0 && (
                <p className="text-[0.77rem] text-[rgba(186,230,253,0.55)] mb-2 m-0">
                    {filteredAndSortedPartidas.length === 0
                        ? "Nenhuma mesa encontrada para os filtros aplicados."
                        : `${filteredAndSortedPartidas.length} de ${total} mesa${total !== 1 ? "s" : ""}`}
                </p>
            )}

            {total === 0 ? (
                <p className="text-[#beafd7] text-[0.9rem] m-0">
                    {isFinished
                        ? "Nenhuma mesa para a rodada selecionada."
                        : "Ainda não há mesas para a rodada atual."}
                </p>
            ) : (
                <div className={`grid grid-cols-[repeat(auto-fill,minmax(min(100%,220px),1fr))] gap-[0.65rem] max-md:grid-cols-1 min-w-0 w-full ${total > 8 ? "max-h-[560px] overflow-y-auto overflow-x-hidden [scrollbar-width:thin] [scrollbar-color:rgba(56,189,248,0.3)_transparent]" : ""}`}>
                    {filteredAndSortedPartidas.map((partida, index) => (
                        <MatchCard
                            key={partida.id || `${partida.rodada}-${index}`}
                            partida={partida}
                            index={index}
                            usuarioId={usuarioId}
                            torneio={torneio}
                            isOwner={isOwner}
                        />
                    ))}
                </div>
            )}
        </section>

        {pairingsOpen && (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                onMouseDown={(e) => { if (e.target === e.currentTarget) setPairingsOpen(false); }}
            >
                <div className="bg-[#110a22] border border-[rgba(56,189,248,0.3)] rounded-2xl p-6 w-full max-w-[860px] max-h-[90vh] overflow-y-auto shadow-[0_24px_64px_rgba(0,0,0,0.6)]">
                    <h3 className="text-white font-semibold text-[1.1rem] m-0 mb-2">Editar Pareamentos da Rodada {selectedRound}</h3>
                    <p className="text-[0.82rem] text-[#94a3b8] m-0 mb-4">Mesas finalizadas ficam travadas. Você pode adicionar mesas, BYE e jogadores ativos sem mesa.</p>

                    <div className="flex gap-2 flex-wrap mb-4">
                        <button type="button" className="px-3 py-1.5 rounded-lg border border-[rgba(56,189,248,0.35)] text-[#7dd3fc] text-[0.8rem] font-semibold bg-[rgba(56,189,248,0.08)]" onClick={() => handleAddTable(false)} disabled={pairingsLoading}>+ Mesa</button>
                        <button type="button" className="px-3 py-1.5 rounded-lg border border-[rgba(250,204,21,0.35)] text-[#fde047] text-[0.8rem] font-semibold bg-[rgba(250,204,21,0.08)]" onClick={() => handleAddTable(true)} disabled={pairingsLoading || byeCount >= 1}>+ BYE</button>
                    </div>

                    <div className="grid gap-3">
                        {pairingsDraft.map((partida, index) => {
                            const conflict =
                                conflictPlayerIds.has(normalizeId(partida.jogador1Id)) ||
                                conflictPlayerIds.has(normalizeId(partida.jogador2Id));
                            return (
                            <div key={partida.clientKey || partida.id || index} className={`grid grid-cols-[1fr_1fr_90px_auto] gap-3 max-[720px]:grid-cols-1 border rounded-xl p-3 bg-white/[0.03] ${partida.locked ? "border-[rgba(34,197,94,0.35)] opacity-90" : conflict ? "border-[rgba(239,68,68,0.45)]" : "border-[rgba(255,255,255,0.08)]"}`}>
                                <SelectField
                                    value={partida.jogador1Id}
                                    onChange={(e) => handlePairingChange(index, "jogador1Id", e.target.value)}
                                    className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(56,189,248,0.2)] rounded-[0.6rem] px-3 py-2 text-[#f5edff]"
                                    placeholder="Jogador 1"
                                    disabled={partida.locked || pairingsLoading}
                                >
                                    {tournamentPlayers.map((player) => <option key={player.id} value={player.id}>{player.nome}</option>)}
                                </SelectField>
                                <SelectField
                                    value={partida.jogador2Id}
                                    onChange={(e) => handlePairingChange(index, "jogador2Id", e.target.value)}
                                    className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(56,189,248,0.2)] rounded-[0.6rem] px-3 py-2 text-[#f5edff]"
                                    placeholder="BYE"
                                    disabled={partida.locked || pairingsLoading}
                                >
                                    {tournamentPlayers.map((player) => <option key={player.id} value={player.id}>{player.nome}</option>)}
                                </SelectField>
                                <input
                                    type="number"
                                    min="1"
                                    value={partida.mesa}
                                    onChange={(e) => handlePairingChange(index, "mesa", e.target.value)}
                                    className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(56,189,248,0.2)] rounded-[0.6rem] px-3 py-2 text-[#f5edff] disabled:opacity-60"
                                    placeholder="Mesa"
                                    disabled={pairingsLoading}
                                />
                                <button
                                    type="button"
                                    className="px-3 py-2 rounded-lg border border-[rgba(239,68,68,0.35)] text-[#fca5a5] text-[0.78rem] font-semibold disabled:opacity-40"
                                    onClick={() => handleRemoveTable(index)}
                                    disabled={partida.locked || pairingsLoading}
                                    title={partida.locked ? "Mesa finalizada" : "Remover mesa"}
                                >
                                    Remover
                                </button>
                                {partida.locked && <span className="col-span-full text-[0.72rem] text-[#86efac]">Finalizada — jogadores travados</span>}
                                {conflict && !partida.locked && <span className="col-span-full text-[0.72rem] text-[#fca5a5]">Conflito: jogador repetido</span>}
                            </div>
                            );
                        })}
                    </div>

                    {unassignedPlayers.length > 0 && (
                        <div className="mt-4 rounded-xl border border-[rgba(250,204,21,0.25)] bg-[rgba(250,204,21,0.06)] px-3 py-2">
                            <p className="m-0 mb-1 text-[0.78rem] font-semibold text-[#fde047]">Sem mesa ({unassignedPlayers.length})</p>
                            <p className="m-0 text-[0.8rem] text-[#fef3c7]">{unassignedPlayers.map((p) => p.nome).join(", ")}</p>
                        </div>
                    )}

                    {pairingsError && <p className="text-[#fca5a5] text-[0.85rem] mt-4 mb-0">{pairingsError}</p>}
                    <div className="flex gap-3 mt-5 max-md:flex-col">
                        <button type="button" className="flex-1 px-4 py-2 border border-[rgba(217,180,255,0.2)] rounded-lg text-[#beafd7] text-[0.9rem] font-semibold bg-transparent hover:text-white hover:border-[rgba(199,149,255,0.4)] transition-colors max-md:w-full" onClick={() => setPairingsOpen(false)} disabled={pairingsLoading}>Cancelar</button>
                        <button type="button" className="flex-1 px-4 py-2 border border-[rgba(56,189,248,0.5)] rounded-lg text-[#7dd3fc] text-[0.9rem] font-semibold bg-[rgba(56,189,248,0.1)] hover:bg-[rgba(56,189,248,0.2)] transition-colors disabled:opacity-50 max-md:w-full" onClick={handleSavePairings} disabled={pairingsLoading}>{pairingsLoading ? "Salvando..." : "Salvar pareamentos"}</button>
                    </div>
                </div>
            </div>
        )}
        </Fragment>
    );
}
