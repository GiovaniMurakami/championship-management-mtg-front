import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { listarTorneios, inscreverTorneio, iniciarTorneio } from "../services/backendApi";
import { useAuth } from "../hooks/useAuth";
import { subscribeToTournament, unsubscribeFromTournament } from "../services/ablyService";
import { TournamentCreateForm } from "../components";

export function TournamentPage() {
    const { token, usuario } = useAuth();
    const [torneios, setTorneios] = useState([]);
    const [loading, setLoading] = useState(false);
    const channelsRef = useRef({});
    const navigate = useNavigate();

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
            loadTorneios();
        },
        [loadTorneios]
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
        return new Date(dateString).toLocaleString("pt-BR");
    };

    const isOwner = (torneio) => torneio.donoId === usuario?.id;

    return (
        <div className="tournament-page">
            <h1>Torneios</h1>

            <TournamentCreateForm token={token} onTournamentCreated={loadTorneios} />

            <section className="tournaments-list-section">
                <h2>Torneios Disponíveis</h2>
                {loading && <p>Carregando...</p>}
                <div className="torneios-list">
                    {torneios.map((torneio) => (
                        <div key={torneio.id} className="torneio-card">
                            <h3>{torneio.nome}</h3>
                            <p>Formato: {torneio.formato}</p>
                            <p>Data: {formatDate(torneio.horario)}</p>
                            <p>
                                Status: <span className={`status-badge status-${torneio.status}`}>{torneio.status.replace("_", " ")}</span>
                            </p>
                            <p>
                                Rodada: {torneio.rodadaAtual}/{torneio.totalRodadas}
                            </p>

                            <div className="actions">
                                <button className="btn-view-standings" onClick={() => handleViewTournament(torneio.id)}>
                                    Ver Torneio
                                </button>

                                {torneio.status === "inscricoes_abertas" && (
                                    <button className="btn-inscrever" onClick={() => handleInscrever(torneio.id)}>
                                        Inscrever-se
                                    </button>
                                )}

                                {isOwner(torneio) && torneio.status === "inscricoes_abertas" && (
                                    <button className="btn-iniciar" onClick={() => handleIniciar(torneio.id)}>
                                        Iniciar Torneio
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
