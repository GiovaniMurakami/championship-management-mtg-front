import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { normalizeId } from "../utils/normalizeId";
import { listarTorneios, inscreverTorneio } from "../services/backendApi";
import { useAuth } from "../hooks/useAuth";
import { subscribeToTournament, unsubscribeFromTournament } from "../services/ablyService";
import { SkeletonTorneioCard } from "../components";

const statusBadgeClass = {
  inscricoes_abertas: "bg-[rgba(34,197,94,0.2)] text-[#22c55e] border border-[#22c55e]",
  em_andamento: "bg-[rgba(251,191,36,0.2)] text-[#fbbf24] border border-[#fbbf24]",
  finalizado: "bg-[rgba(239,68,68,0.2)] text-[#ef4444] border border-[#ef4444]",
};

export function TournamentPage() {
  const { token, usuario, isAdmin } = useAuth();
  const [torneios, setTorneios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inscricoesLocais, setInscricoesLocais] = useState({});
  const [inscricaoErro, setInscricaoErro] = useState("");
  const [abaAtiva, setAbaAtiva] = useState("disponiveis");
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

  const handleRodadaIniciada = useCallback((_torneioId, data) => {
    console.log("Rodada iniciada:", data);
    loadTorneios();
  }, [loadTorneios]);

  const handleResultadoRegistrado = useCallback((_torneioId, data) => {
    console.log("Resultado registrado:", data);
    loadTorneios();
  }, [loadTorneios]);

  const handleTorneioFinalizado = useCallback((_torneioId, data) => {
    console.log("Torneio finalizado:", data);
    loadTorneios();
  }, [loadTorneios]);

  const handleParticipanteInscrito = useCallback((_torneioId, data) => {
    console.log("Participante inscrito:", data);
    const inscritoId = normalizeId(data?.usuarioId || data?.userId || data?.usuario?.id || data?.id);
    if (inscritoId && inscritoId === normalizeId(usuario?.id)) {
      setInscricoesLocais((prev) => ({ ...prev, [_torneioId]: true }));
    }
    loadTorneios();
  }, [loadTorneios, usuario?.id]);

  const handleCheckinRealizado = useCallback((_torneioId, data) => {
    console.log("Checkin realizado:", data);
    loadTorneios();
  }, [loadTorneios]);

  useEffect(() => {
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
    if (!usuario?.nickMTGO) {
      setInscricaoErro("É necessário configurar um nick do MTGO no seu perfil antes de se inscrever. Acesse seu perfil pelo menu superior.");
      setTimeout(() => setInscricaoErro(""), 6000);
      return;
    }
    try {
      await inscreverTorneio(torneioId, token);
      setInscricoesLocais((prev) => ({ ...prev, [torneioId]: true }));
      loadTorneios();
    } catch (error) {
      console.error("Erro ao inscrever:", error);
    }
  };

  const handleViewTournament = (torneioId) => navigate(`/torneios/${torneioId}`);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleString("pt-BR", { timeZone: "UTC" });

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
    <div className="max-w-[1200px] mx-auto px-6 pt-[7.5rem] pb-12 max-[768px]:px-4 max-[768px]:pt-[6.5rem]">
      {inscricaoErro && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-xl border border-[rgba(252,88,119,0.4)] bg-[rgba(30,15,45,0.95)] backdrop-blur-md text-[#ffa8b8] text-[0.9rem] font-semibold shadow-[0_8px_24px_rgba(0,0,0,0.4)] max-w-[90vw] text-center flex items-center gap-3">
          <span>{inscricaoErro}</span>
          <button type="button" onClick={() => setInscricaoErro("")} className="ml-1 text-[#ffa8b8] hover:text-white bg-transparent border-none cursor-pointer text-lg leading-none">×</button>
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6 max-[768px]:mb-5">
        <h1 className="m-0 text-white text-[2.2rem] font-bold [text-shadow:0_2px_4px_rgba(0,0,0,0.3)] max-[768px]:text-[1.75rem]">
          Torneios
        </h1>
        {isAdmin && (
          <button
            className="px-4 py-[0.7rem] rounded-lg border border-[#4f46e5] bg-[rgba(79,70,229,0.12)] text-[#d9d6ff] cursor-pointer font-semibold transition-all duration-200 hover:bg-[#4f46e5] hover:text-white"
            type="button"
            onClick={() => navigate("/torneios/criar")}
          >
            + Criar Torneio
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b-2 border-[#2a2a3e]">
        {[
          { key: "disponiveis", label: "Torneios Disponíveis", count: torneiosDisponiveis.length },
          { key: "anteriores", label: "Torneios Anteriores", count: torneiosAnteriores.length },
        ].map(({ key, label, count }) => (
          <button
            key={key}
            type="button"
            className={`flex items-center gap-2 px-5 py-[0.65rem] bg-transparent border-none border-b-2 -mb-[2px] text-[0.95rem] font-medium cursor-pointer transition-colors duration-200 ${abaAtiva === key
              ? "text-white border-b-[#4f46e5] border-b-2"
              : "text-[#888] border-b-transparent hover:text-[#c0bfff]"
              }`}
            onClick={() => setAbaAtiva(key)}
          >
            {label}
            {count > 0 && (
              <span className="bg-[#4f46e5] text-white text-[0.75rem] font-semibold px-[0.45rem] py-[0.1rem] rounded-full leading-[1.4]">
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      <section className="mt-6">
        {loading ? (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-5 mb-8">
            {[1, 2, 3].map((i) => <SkeletonTorneioCard key={i} />)}
          </div>
        ) : torneiosExibidos.length === 0 ? (
          <p className="text-center text-[#888] py-12 text-base">
            {abaAtiva === "disponiveis"
              ? "Nenhum torneio disponível no momento."
              : "Nenhum torneio anterior encontrado."}
          </p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-5 mb-8 max-[768px]:grid-cols-1">
            {torneiosExibidos.map((torneio) => {
              const inscrito = isInscrito(torneio);
              return (
                <div
                  key={torneio.id}
                  className="bg-[linear-gradient(155deg,rgba(26,16,50,0.98)_0%,rgba(16,10,32,0.98)_100%)] rounded-[1.1rem] shadow-[0_6px_28px_rgba(0,0,0,0.35)] border border-[rgba(217,180,255,0.2)] transition-all duration-[220ms] relative overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-[0_14px_44px_rgba(0,0,0,0.45)] hover:border-[rgba(167,79,255,0.3)]"
                >
                  {/* Banner image */}
                  {torneio.bannerUrl && (
                    <div className="relative w-full h-[220px] overflow-hidden rounded-t-[1.1rem]">
                      <img
                        src={torneio.bannerUrl}
                        alt={`Banner de ${torneio.nome}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(16,10,32,0.9)]" />
                    </div>
                  )}

                  {/* Card header */}
                  <div className="flex items-center justify-between px-5 py-[0.9rem] pb-3 border-b border-[rgba(217,180,255,0.2)] bg-white/[0.02]">
                    <span className="font-['Bebas_Neue',sans-serif] text-[1.1rem] tracking-[0.12em] text-[#c795ff]">
                      {(torneio.formato || "—").toUpperCase()}
                    </span>
                    <span className={`inline-block px-3 py-1 rounded-[20px] text-[0.8rem] font-medium uppercase tracking-[0.5px] ${statusBadgeClass[torneio.status] ?? ""}`}>
                      {torneio.status === "inscricoes_abertas" && "Inscrições Abertas"}
                      {torneio.status === "em_andamento" && "Em Andamento"}
                      {torneio.status === "finalizado" && "Finalizado"}
                    </span>
                  </div>

                  <h3 className="text-[#f5edff] m-0 mb-[0.9rem] font-['Bebas_Neue',sans-serif] text-[1.55rem] tracking-[0.03em] leading-[1.1] px-5 pt-4 max-[600px]:text-[1.3rem]">
                    {torneio.nome}
                  </h3>

                  <div className="flex flex-col gap-[0.45rem] px-5 pb-4">
                    <div className="flex items-center gap-2 text-[#beafd7] text-[0.85rem]">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(167,79,255,0.7)" strokeWidth="2.5" aria-hidden="true" className="shrink-0">
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <span>{formatDate(torneio.horario)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#beafd7] text-[0.85rem]">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(167,79,255,0.7)" strokeWidth="2.5" aria-hidden="true" className="shrink-0">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      <span>{torneio.totalInscritos ?? "—"} inscritos</span>
                    </div>
                    {torneio.status !== "inscricoes_abertas" && (
                      <div className="flex items-center gap-2 text-[#beafd7] text-[0.85rem]">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(167,79,255,0.7)" strokeWidth="2.5" aria-hidden="true" className="shrink-0">
                          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                          <polyline points="17 6 23 6 23 12" />
                        </svg>
                        <span>Rodada {torneio.rodadaAtual}/{torneio.totalRodadas}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-auto px-5 py-[0.85rem] pb-[1.1rem] border-t border-[rgba(217,180,255,0.2)] bg-white/[0.015] flex gap-3 flex-wrap max-[768px]:flex-col">
                    <button
                      className="px-4 py-2 border border-[#4f46e5] rounded-md text-[0.9rem] font-medium cursor-pointer uppercase tracking-[0.5px] bg-[rgba(79,70,229,0.1)] text-[#4f46e5] transition-all duration-300 hover:bg-[#4f46e5] hover:text-white hover:-translate-y-px active:translate-y-0 max-[768px]:w-full"
                      onClick={() => handleViewTournament(torneio.id)}
                    >
                      Ver Torneio
                    </button>

                    {isAdmin && (
                      <button
                        className="px-4 py-2 border border-[rgba(167,79,255,0.5)] rounded-md text-[0.9rem] font-medium cursor-pointer uppercase tracking-[0.5px] bg-[rgba(167,79,255,0.08)] text-[#c795ff] transition-all duration-300 hover:bg-[rgba(167,79,255,0.22)] hover:text-white hover:-translate-y-px active:translate-y-0 max-[768px]:w-full flex items-center justify-center gap-[0.4rem]"
                        type="button"
                        onClick={() => navigate("/torneios/criar", { state: { copyFrom: torneio } })}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                          <rect x="9" y="9" width="13" height="13" rx="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        Copiar
                      </button>
                    )}

                    {torneio.status === "inscricoes_abertas" && (
                      <button
                        className={`px-4 py-2 border rounded-md text-[0.9rem] font-medium cursor-pointer uppercase tracking-[0.5px] transition-all duration-300 hover:-translate-y-px active:translate-y-0 max-[768px]:w-full disabled:opacity-80 disabled:cursor-not-allowed ${inscrito
                          ? "bg-[rgba(148,163,184,0.16)] text-[#cbd5e1] border-[#94a3b8] cursor-default hover:translate-y-0"
                          : "bg-[rgba(34,197,94,0.1)] text-[#22c55e] border-[#22c55e] hover:bg-[#22c55e] hover:text-white"
                          }`}
                        onClick={() => !inscrito && handleInscrever(torneio.id)}
                        disabled={inscrito}
                      >
                        {inscrito ? "✓ Inscrito" : "Inscrever-se"}
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
