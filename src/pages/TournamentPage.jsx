import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { listarTorneios, inscreverTorneio, iniciarTorneio } from "../services/backendApi";
import { useAuth } from "../hooks/useAuth";
import { subscribeToTournament, unsubscribeFromTournament } from "../services/ablyService";
import { SkeletonTorneioCard } from "../components";

export function TournamentPage() {
    const { token, usuario, isAdmin } = useAuth();
    const [torneios, setTorneios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [inscricoesLocais, setInscricoesLocais] = useState({});
    const [abaAtiva, setAbaAtiva] = useState("disponiveis");
    const channelsRef = useRef({});
    const navigate = useNavigate();

    const normalizeId = (value) => (value === undefined || value === null ? "" : String(value));

    const loadTorneios = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const data = await listarTorneios(token);
            setTorneios(data.torneios || []);
        } catch (error) {
            console.error("Erro ao carregar torneios:", error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        loadTorneios();
    }, [loadTorneios]);

    const handleRodadaIniciada = useCallback(
        (torneioId, data) => {
            console.log("Rodada iniciada:", data);
            loadTorneios();
        },
        [loadTorneios]
    );

    const handleResultadoRegistrado = useCallback(
        (torneioId, data) => {
            console.log("Resultado registrado:", data);
            loadTorneios();
        },
        [loadTorneios]
    );

    const handleTorneioFinalizado = useCallback(
        (torneioId, data) => {
            console.log("Torneio finalizado:", data);
            loadTorneios();
        },
        [loadTorneios]
    );

    const handleParticipanteInscrito = useCallback(
        (torneioId, data) => {
            console.log("Participante inscrito:", data);
            const inscritoId = normalizeId(data?.usuarioId || data?.userId || data?.usuario?.id || data?.id);
            if (inscritoId && inscritoId === normalizeId(usuario?.id)) {
                setInscricoesLocais((prev) => ({
                    ...prev,
                    [torneioId]: true,
                }));
            }
            loadTorneios();
        },
        [loadTorneios, usuario?.id]
    );

    const handleCheckinRealizado = useCallback(
        (torneioId, data) => {
            console.log("Checkin realizado:", data);
            loadTorneios();
        },
        [loadTorneios]
    );

    useEffect(() => {
        // Subscribe to new tournaments only — uses ref to avoid infinite loop
        torneios.forEach((torneio) => {
            if (!channelsRef.current[torneio.id]) {
                const channel = subscribeToTournament(torneio.id, {
                    onRodadaIniciada: (message) => handleRodadaIniciada(torneio.id, message.data),
                    onResultadoRegistrado: (message) => handleResultadoRegistrado(torneio.id, message.data),
                    onTorneioFinalizado: (message) => handleTorneioFinalizado(torneio.id, message.data),
                    onParticipanteInscrito: (message) => handleParticipanteInscrito(torneio.id, message.data),
                    onCheckinRealizado: (message) => handleCheckinRealizado(torneio.id, message.data),
                });
                channelsRef.current[torneio.id] = channel;
            }
        });

        return () => {
            Object.values(channelsRef.current).forEach((channel) => {
                if (channel) unsubscribeFromTournament(channel);
            });
            channelsRef.current = {};
        };
    }, [torneios, handleRodadaIniciada, handleResultadoRegistrado, handleTorneioFinalizado, handleParticipanteInscrito, handleCheckinRealizado]);

    const handleInscrever = async (torneioId) => {
        try {
            await inscreverTorneio(torneioId, token);
            setInscricoesLocais((prev) => ({
                ...prev,
                [torneioId]: true,
            }));
            loadTorneios();
        } catch (error) {
            console.error("Erro ao inscrever:", error);
        }
    };

    const handleIniciar = async (torneioId) => {
        try {
            await iniciarTorneio(torneioId, token);
            loadTorneios();
        } catch (error) {
            console.error("Erro ao iniciar torneio:", error);
        }
    };

    const handleViewTournament = (torneioId) => {
        navigate(`/torneios/${torneioId}`);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString("pt-BR", { timeZone: "UTC" });
    };

    const isOwner = (torneio) => normalizeId(torneio.donoId) === normalizeId(usuario?.id);

    const isInscrito = (torneio) => {
        if (!usuario?.id) return false;
        return !!(inscricoesLocais[torneio.id] || torneio?.inscrito);
    };

    const torneiosDisponiveis = useMemo(
        () => torneios.filter((t) => t.status === "inscricoes_abertas" || t.status === "em_andamento"),
        [torneios],
    );

    const torneiosAnteriores = useMemo(
        () => torneios.filter((t) => t.status === "finalizado"),
        [torneios],
    );

    const torneiosExibidos = abaAtiva === "disponiveis" ? torneiosDisponiveis : torneiosAnteriores;

    return (
        <div className="tournament-page">
            <div className="tournament-page-header">
                <h1>Torneios</h1>
                {isAdmin && (
                    <button
                        className="btn-create-tournament-route"
                        type="button"
                        onClick={() => navigate("/torneios/criar")}
                    >
                        + Criar Torneio
                    </button>
                )}
            </div>

            <div className="tournament-tabs">
                <button
                    type="button"
                    className={`tournament-tab${abaAtiva === "disponiveis" ? " tournament-tab--active" : ""}`}
                    onClick={() => setAbaAtiva("disponiveis")}
                >
                    Torneios Disponíveis
                    {torneiosDisponiveis.length > 0 && (
                        <span className="tournament-tab-count">{torneiosDisponiveis.length}</span>
                    )}
                </button>
                <button
                    type="button"
                    className={`tournament-tab${abaAtiva === "anteriores" ? " tournament-tab--active" : ""}`}
                    onClick={() => setAbaAtiva("anteriores")}
                >
                    Torneios Anteriores
                    {torneiosAnteriores.length > 0 && (
                        <span className="tournament-tab-count">{torneiosAnteriores.length}</span>
                    )}
                </button>
            </div>

            <section className="tournaments-list-section">
                {loading ? (
                    <div className="torneios-list">
                        {[1, 2, 3].map((i) => <SkeletonTorneioCard key={i} />)}
                    </div>
                ) : torneiosExibidos.length === 0 ? (
                    <p className="torneios-empty">
                        {abaAtiva === "disponiveis"
                            ? "Nenhum torneio disponível no momento."
                            : "Nenhum torneio anterior encontrado."}
                    </p>
                ) : (
                    <div className="torneios-list">
                        {torneiosExibidos.map((torneio) => {
                            const inscrito = isInscrito(torneio);
                            return (
                                <div key={torneio.id} className="torneio-card">
                                    <div className="torneio-card__header">
                                        <span className="torneio-card__formato">{(torneio.formato || "—").toUpperCase()}</span>
                                        <span className={`status-badge status-${torneio.status}`}>
                                            {torneio.status === "inscricoes_abertas" && "Inscrições Abertas"}
                                            {torneio.status === "em_andamento" && "Em Andamento"}
                                            {torneio.status === "finalizado" && "Finalizado"}
                                        </span>
                                    </div>

                                    <h3 className="torneio-card__nome">{torneio.nome}</h3>

                                    <div className="torneio-card__info">
                                        <div className="torneio-card__info-item">
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                                            <span>{formatDate(torneio.horario)}</span>
                                        </div>
                                        <div className="torneio-card__info-item">
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                                            <span>{torneio.totalInscritos ?? "—"} inscritos</span>
                                        </div>
                                        {torneio.status !== "inscricoes_abertas" && (
                                            <div className="torneio-card__info-item">
                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
                                                <span>Rodada {torneio.rodadaAtual}/{torneio.totalRodadas}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="actions">
                                        <button className="btn-view-standings" onClick={() => handleViewTournament(torneio.id)}>
                                            Ver Torneio
                                        </button>

                                        {torneio.status === "inscricoes_abertas" && (
                                            <button
                                                className={inscrito ? "btn-inscrito" : "btn-inscrever"}
                                                onClick={() => !inscrito && handleInscrever(torneio.id)}
                                                disabled={inscrito}
                                            >
                                                {inscrito ? "✓ Inscrito" : "Inscrever-se"}
                                            </button>
                                        )}

                                        {isOwner(torneio) && torneio.status === "inscricoes_abertas" && (
                                            <button className="btn-iniciar" onClick={() => handleIniciar(torneio.id)}>
                                                Iniciar Torneio
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}
