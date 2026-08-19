import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  buscarTime, sairDoTime, deletarTime,
  gerarConviteTime, solicitarEntradaTime, aprovarSolicitacao, rejeitarSolicitacao,
} from "../services/backendApi";
import { useAuth } from "../hooks/useAuth";
import { PageShell } from "../components/ui/PageShell";
import { InlineAlert } from "../components/ui/InlineAlert";
import { DeleteConfirmModal } from "../components/ui/DeleteConfirmModal";
import { UsuarioNomeExibicao } from "../components/ui/UsuarioExcluidoTag";
import { buildTeamInviteExternalUrl } from "../utils/externalNavigation";
import { logError } from "../utils/logger";
import { usePageTitle } from "../hooks/usePageTitle";
import { PAGE_TITLES } from "../constants/pageTitles";

function getInitials(nome) {
  if (!nome) return "?";
  return nome.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

const AVATAR_PALETTES = [
  "from-[#8e39ed] to-[#5f23b3]",
  "from-[#0d9488] to-[#0891b2]",
  "from-[#d97706] to-[#b45309]",
  "from-[#7c3aed] to-[#4f46e5]",
  "from-[#be185d] to-[#9d174d]",
];

const getTotalMembros = (time) =>
  time?.totalMembros ?? time?.membroIds?.length ?? time?.membros?.length ?? 0;

export function TimeDetailPage() {
  const { id: timeId } = useParams();
  const { token, usuario, isAdmin, requireAuth } = useAuth();
  const navigate = useNavigate();

  const [time, setTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [conviteToken, setConviteToken] = useState(null);
  const [conviteLoading, setConviteLoading] = useState(false);
  const [conviteCopied, setConviteCopied] = useState(false);
  const [aprovandoId, setAprovandoId] = useState(null);
  const [rejeitandoId, setRejeitandoId] = useState(null);

  usePageTitle(time?.nome, { loading, fallback: "Time" });

  const loadTime = useCallback(async () => {
    if (!timeId) return;
    setLoading(true);
    try {
      const data = await buscarTime(timeId, token);
      setTime(data.time || data);
    } catch (err) {
      logError("Erro ao carregar time:", err);
      setError("Erro ao carregar time.");
    } finally {
      setLoading(false);
    }
  }, [timeId, token]);

  useEffect(() => { loadTime(); }, [loadTime]);

  const membros = time?.membros || [];
  const totalMembros = getTotalMembros(time);
  const solicitacoes = time?.solicitacoesPendentes || [];
  const isMember = time?.membroIds?.some((id) => String(id) === String(usuario?.id))
    || membros.some((m) => String(m.id ?? m.usuarioId) === String(usuario?.id));
  const isOwner = time && String(time.donoId) === String(usuario?.id);
  const canManage = isOwner || isAdmin;
  const jaSolicitou = solicitacoes.some((s) => String(s.id) === String(usuario?.id));

  const handleSair = async () => {
    setActionLoading(true);
    setError("");
    try {
      await sairDoTime(timeId, token);
      await loadTime();
    } catch (err) {
      setError(err.message || "Erro ao sair do time.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deletarTime(timeId, token);
      navigate("/times");
    } catch (err) {
      setError(err.message || "Erro ao excluir time.");
      setDeleting(false);
      setShowDelete(false);
    }
  };

  const handleGerarConvite = async () => {
    setConviteLoading(true);
    setError("");
    try {
      const data = await gerarConviteTime(timeId, token);
      const res = data?.data ?? data;
      setConviteToken(res?.conviteToken || null);
    } catch (err) {
      setError(err.message || "Erro ao gerar convite.");
    } finally {
      setConviteLoading(false);
    }
  };

  const conviteLink = conviteToken
    ? buildTeamInviteExternalUrl(conviteToken)
    : null;

  const handleCopyConvite = () => {
    if (!conviteLink) return;
    navigator.clipboard.writeText(conviteLink).then(() => {
      setConviteCopied(true);
      setTimeout(() => setConviteCopied(false), 2000);
    });
  };

  const handleSolicitar = async (authOverride) => {
    const authToken = authOverride?.token ?? token;
    if (!authToken) {
      requireAuth((auth) => handleSolicitar(auth));
      return;
    }
    setActionLoading(true);
    setError("");
    try {
      await solicitarEntradaTime(timeId, authToken);
      await loadTime();
    } catch (err) {
      setError(err.message || "Erro ao enviar solicitação.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAprovar = async (usuarioId) => {
    setAprovandoId(usuarioId);
    setError("");
    try {
      await aprovarSolicitacao(timeId, usuarioId, token);
      await loadTime();
    } catch (err) {
      setError(err.message || "Erro ao aprovar solicitação.");
    } finally {
      setAprovandoId(null);
    }
  };

  const handleRejeitar = async (usuarioId) => {
    setRejeitandoId(usuarioId);
    setError("");
    try {
      await rejeitarSolicitacao(timeId, usuarioId, token);
      await loadTime();
    } catch (err) {
      setError(err.message || "Erro ao rejeitar solicitação.");
    } finally {
      setRejeitandoId(null);
    }
  };

  if (loading) {
    return (
      <PageShell>
        <div className="animate-pulse max-w-[680px]">
          <div className="h-9 w-64 bg-white/[0.06] rounded-lg mb-3" />
          <div className="h-4 w-96 bg-white/[0.04] rounded mb-6" />
          <div className="h-[300px] bg-white/[0.03] rounded-xl" />
        </div>
      </PageShell>
    );
  }

  if (!time) {
    return (
      <PageShell>
        <p className="text-center text-[#888] py-12">Time não encontrado.</p>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <button
          className="inline-flex items-center gap-[0.4rem] px-4 py-2 border border-[rgba(217,180,255,0.2)] rounded-xl bg-white/[0.03] text-[#beafd7] text-[0.9rem] font-medium cursor-pointer transition-all duration-200 hover:text-white hover:border-[rgba(199,149,255,0.5)] hover:bg-white/[0.06]"
          onClick={() => navigate("/times")}
        >
          ← Voltar para times
        </button>
        {canManage && (
          <div className="flex items-center gap-2">
            <button
              className="px-4 py-2 border border-[#4f46e5] rounded-lg bg-[rgba(79,70,229,0.12)] text-[#d9d6ff] text-[0.88rem] font-medium cursor-pointer transition-all duration-200 hover:bg-[#4f46e5] hover:text-white"
              onClick={() => navigate(`/times/${timeId}/editar`)}
            >
              Editar
            </button>
            <button
              className="px-4 py-2 border border-[rgba(239,68,68,0.4)] rounded-lg bg-[rgba(239,68,68,0.08)] text-[#fca5a5] text-[0.88rem] font-medium cursor-pointer transition-all duration-200 hover:bg-[rgba(239,68,68,0.2)]"
              onClick={() => setShowDelete(true)}
            >
              Excluir
            </button>
          </div>
        )}
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          {time.imagemUrl && (
            <img
              src={time.imagemUrl}
              alt={time.nome}
              className="w-16 h-16 rounded-xl object-cover border border-[rgba(199,149,255,0.25)] flex-shrink-0"
            />
          )}
          <h1 className="m-0 text-white text-[2rem] font-['Bebas_Neue',sans-serif] tracking-[0.03em]">
            {time.nome}
          </h1>
        </div>
        {time.descricao && (
          <p className="m-0 text-[#beafd7] text-[0.95rem] leading-relaxed max-w-[680px] mb-4">{time.descricao}</p>
        )}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="inline-flex items-center gap-[0.4rem] text-[0.8rem] text-[#beafd7]">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(167,79,255,0.7)" strokeWidth="2.5" aria-hidden="true">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            {totalMembros} membro{totalMembros !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {error && (
        <InlineAlert type="error" className="mb-4" onDismiss={() => setError("")}>
          {error}
        </InlineAlert>
      )}

      {/* Ações de entrar/sair/solicitar */}
      {usuario && !isOwner && (
        <div className="mb-6 flex flex-wrap gap-2">
          {isMember ? (
            <button
              className="inline-flex items-center justify-center px-5 py-[0.6rem] border border-[rgba(239,68,68,0.4)] rounded-[0.7rem] text-[0.9rem] font-semibold cursor-pointer transition-all duration-200 text-[#fca5a5] bg-[rgba(239,68,68,0.1)] hover:bg-[rgba(239,68,68,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSair}
              disabled={actionLoading}
            >
              {actionLoading ? "Aguarde..." : "Sair do Time"}
            </button>
          ) : jaSolicitou ? (
            <span className="inline-flex items-center px-5 py-[0.6rem] border border-[rgba(251,191,36,0.35)] rounded-[0.7rem] text-[0.9rem] font-semibold text-[#fde68a] bg-[rgba(251,191,36,0.08)]">
              ⏳ Solicitação enviada
            </span>
          ) : (
            <button
              className="inline-flex items-center justify-center px-5 py-[0.6rem] border border-[rgba(167,79,255,0.4)] rounded-[0.7rem] text-[0.9rem] font-semibold cursor-pointer transition-all duration-200 text-[#c4b5fd] bg-[rgba(167,79,255,0.08)] hover:bg-[rgba(167,79,255,0.16)] disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSolicitar}
              disabled={actionLoading}
            >
              {actionLoading ? "Aguarde..." : "Solicitar Entrada"}
            </button>
          )}
        </div>
      )}

      {/* Gerar Convite (dono) */}
      {canManage && (
        <div className="mb-6">
          {conviteToken ? (
            <div className="flex flex-col gap-2 p-4 border border-[rgba(34,197,94,0.3)] rounded-xl bg-[rgba(34,197,94,0.06)]">
              <p className="m-0 text-[0.82rem] text-[#86efac] font-semibold">Link de convite gerado — compartilhe com quem você quiser convidar:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 min-w-0 bg-[rgba(0,0,0,0.3)] text-[#7ef2a3] text-[0.8rem] font-mono px-3 py-[0.4rem] rounded-lg border border-[rgba(34,197,94,0.2)] overflow-x-auto whitespace-nowrap">
                  {conviteLink}
                </code>
                <button
                  type="button"
                  onClick={handleCopyConvite}
                  className="flex-shrink-0 px-3 py-[0.4rem] border border-[rgba(34,197,94,0.4)] rounded-lg text-[0.8rem] font-semibold text-[#86efac] bg-[rgba(34,197,94,0.1)] hover:bg-[rgba(34,197,94,0.2)] transition-colors"
                >
                  {conviteCopied ? "✓ Copiado!" : "Copiar"}
                </button>
              </div>
              <button
                type="button"
                onClick={() => { setConviteToken(null); setConviteCopied(false); }}
                className="self-start text-[0.75rem] text-[rgba(190,175,215,0.5)] hover:text-[#beafd7] transition-colors"
              >
                Fechar
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleGerarConvite}
              disabled={conviteLoading}
              className="inline-flex items-center gap-2 px-5 py-[0.6rem] border border-[rgba(199,149,255,0.3)] rounded-[0.7rem] text-[0.9rem] font-semibold cursor-pointer transition-all duration-200 text-[#c4b5fd] bg-[rgba(167,79,255,0.08)] hover:bg-[rgba(167,79,255,0.16)] hover:border-[rgba(199,149,255,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {conviteLoading ? "Gerando..." : "🔗 Gerar Convite"}
            </button>
          )}
        </div>
      )}

      {/* Solicitações pendentes (dono) */}
      {canManage && solicitacoes.length > 0 && (
        <div className="mb-6 bg-[linear-gradient(155deg,rgba(26,16,50,0.98)_0%,rgba(16,10,32,0.98)_100%)] rounded-[1rem] border border-[rgba(251,191,36,0.2)] overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-[0.6rem] border-b border-[rgba(251,191,36,0.15)] bg-[rgba(251,191,36,0.04)]">
            <span className="text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[#fbbf24]">
              Solicitações Pendentes
            </span>
            <span className="text-[0.68rem] font-bold text-[#fbbf24] bg-[rgba(251,191,36,0.2)] border border-[rgba(251,191,36,0.4)] rounded-full px-[0.45rem] py-[0.05rem]">
              {solicitacoes.length}
            </span>
          </div>
          <ul className="divide-y divide-[rgba(251,191,36,0.08)] m-0 p-0 list-none">
            {solicitacoes.map((s) => (
              <li key={s.id} className="flex items-center gap-3 px-5 py-[0.75rem]">
                <span className="flex-1 min-w-0 text-[0.92rem] font-semibold text-[#f5edff] overflow-hidden text-ellipsis whitespace-nowrap">
                  {s.nome || s.id}
                </span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleAprovar(s.id)}
                    disabled={aprovandoId === s.id || rejeitandoId === s.id}
                    className="px-3 py-1 text-[0.78rem] font-semibold border border-[rgba(34,197,94,0.4)] rounded-lg text-[#86efac] bg-[rgba(34,197,94,0.08)] hover:bg-[rgba(34,197,94,0.18)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {aprovandoId === s.id ? "..." : "Aprovar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRejeitar(s.id)}
                    disabled={aprovandoId === s.id || rejeitandoId === s.id}
                    className="px-3 py-1 text-[0.78rem] font-semibold border border-[rgba(239,68,68,0.35)] rounded-lg text-[#fca5a5] bg-[rgba(239,68,68,0.06)] hover:bg-[rgba(239,68,68,0.15)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {rejeitandoId === s.id ? "..." : "Rejeitar"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Membros */}
      <div className="bg-[linear-gradient(155deg,rgba(26,16,50,0.98)_0%,rgba(16,10,32,0.98)_100%)] rounded-[1rem] border border-[rgba(217,180,255,0.15)] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-[0.6rem] border-b border-[rgba(217,180,255,0.1)] bg-white/[0.015]">
          <span className="text-[0.78rem] text-[#beafd7]">
            <span className="font-semibold text-[#f5edff]">{totalMembros}</span> membro{totalMembros !== 1 ? "s" : ""}
          </span>
        </div>
        {membros.length === 0 ? (
          <p className="text-center text-[#888] py-8 text-[0.9rem]">Nenhum membro neste time.</p>
        ) : (
          <ul className="divide-y divide-[rgba(217,180,255,0.07)] m-0 p-0 list-none">
            {membros.map((membro, idx) => {
              const nome = membro.nome || membro.usuario?.nome || "—";
              const excluido = Boolean(membro.excluido || membro.usuario?.excluido);
              const isMe = String(membro.id ?? membro.usuarioId) === String(usuario?.id);
              const isCapitao = String(membro.id ?? membro.usuarioId) === String(time.donoId);
              return (
                <li
                  key={membro.id ?? membro.usuarioId ?? idx}
                  className={`flex items-center gap-3 px-5 py-[0.85rem] transition-colors duration-150 hover:bg-white/[0.025] ${isMe ? "bg-[rgba(79,70,229,0.07)] border-l-[3px] border-l-[rgba(99,102,241,0.55)]" : ""}`}
                >
                  <span
                    className={`w-9 h-9 rounded-full bg-gradient-to-br ${AVATAR_PALETTES[idx % AVATAR_PALETTES.length]} flex items-center justify-center text-[0.72rem] font-bold text-white flex-shrink-0 select-none`}
                  >
                    {getInitials(excluido ? "UE" : nome)}
                  </span>
                  <div className="flex-1 min-w-0 flex items-center gap-[0.45rem] overflow-hidden">
                    <span className="font-semibold overflow-hidden text-ellipsis whitespace-nowrap text-[0.92rem] text-[#c4b5fd]">
                      <UsuarioNomeExibicao nome={nome} excluido={excluido} />
                    </span>
                    {isMe && (
                      <span className="inline-block text-[0.62rem] font-bold text-[#818cf8] bg-[rgba(79,70,229,0.2)] border border-[rgba(79,70,229,0.45)] rounded-full px-[0.4rem] py-[0.05rem] tracking-[0.07em] flex-shrink-0">
                        VOCÊ
                      </span>
                    )}
                    {isCapitao && (
                      <span className="inline-block text-[0.62rem] font-bold text-[#fbbf24] bg-[rgba(251,191,36,0.15)] border border-[rgba(251,191,36,0.4)] rounded-full px-[0.4rem] py-[0.05rem] tracking-[0.07em] flex-shrink-0">
                        CAPITÃO
                      </span>
                    )}
                  </div>
                  {!excluido && membro.nickMTGO && (
                    <span className="text-[0.72rem] text-[#c795ff] font-mono flex-shrink-0">{membro.nickMTGO}</span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {showDelete && (
        <DeleteConfirmModal
          isOpen={showDelete}
          onClose={() => setShowDelete(false)}
          onConfirm={handleDelete}
          loading={deleting}
          itemName={time.nome}
        />
      )}
    </PageShell>
  );
}
