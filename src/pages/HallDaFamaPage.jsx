import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { LandingHeader } from "../components/ui/LandingHeader";
import { Footer, CookieConsentBanner } from "../components";
import { SkeletonHallDaFama } from "../components/ui/Skeleton";
import { AdSenseUnit } from "../components/ui/AdSenseUnit";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import { useLandingSeo } from "../hooks/useLandingSeo";
import {
  atualizarHallDaFama,
  excluirHallDaFama,
  listarHallDaFama,
} from "../services/backendApi";
import { tournamentPath } from "../utils/tournamentUrl";

const PAGE_SIZE = 24;

const ADMIN_ACTION_CLASS =
  "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold backdrop-blur-md transition disabled:cursor-wait disabled:opacity-60";

export function HallDaFamaPage() {
  useLandingSeo("hallDaFama");
  const { token, isAdmin } = useAuth();
  const { addToast } = useToast();
  const [itens, setItens] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let ativo = true;
    setLoading(true);
    const params = { limite: PAGE_SIZE, offset };
    if (isAdmin) params.incluirInativos = true;
    listarHallDaFama(params, isAdmin ? token : undefined)
      .then((data) => {
        if (!ativo) return;
        setItens(Array.isArray(data?.itens) ? data.itens : []);
        setTotal(Number(data?.total) || 0);
      })
      .catch(() => {
        if (!ativo) return;
        setItens([]);
        setTotal(0);
      })
      .finally(() => {
        if (ativo) setLoading(false);
      });
    return () => { ativo = false; };
  }, [offset, isAdmin, token]);

  const removerLocal = (id) => {
    setItens((prev) => prev.filter((item) => item.id !== id));
    setTotal((t) => Math.max(0, t - 1));
    setLightbox((atual) => (atual?.id === id ? null : atual));
  };

  const atualizarAtivoLocal = (id, ativo) => {
    setItens((prev) => prev.map((item) => (item.id === id ? { ...item, ativo } : item)));
    setLightbox((atual) => (atual?.id === id ? { ...atual, ativo } : atual));
  };

  const ocultar = async (id) => {
    if (!token || !isAdmin) return;
    setBusyId(id);
    try {
      await atualizarHallDaFama(id, { ativo: false }, token);
      atualizarAtivoLocal(id, false);
      addToast("Item ocultado do Hall.", { type: "success" });
    } catch (err) {
      addToast(err.message || "Falha ao ocultar.", { type: "error" });
    } finally {
      setBusyId(null);
    }
  };

  const desocultar = async (id) => {
    if (!token || !isAdmin) return;
    setBusyId(id);
    try {
      await atualizarHallDaFama(id, { ativo: true }, token);
      atualizarAtivoLocal(id, true);
      addToast("Item visível novamente no Hall.", { type: "success" });
    } catch (err) {
      addToast(err.message || "Falha ao desocultar.", { type: "error" });
    } finally {
      setBusyId(null);
    }
  };

  const excluir = async (id) => {
    if (!token || !isAdmin) return;
    if (!window.confirm("Excluir permanentemente este Top 8 do Hall?")) return;
    setBusyId(id);
    try {
      await excluirHallDaFama(id, token);
      removerLocal(id);
      addToast("Item excluído.", { type: "success" });
    } catch (err) {
      addToast(err.message || "Falha ao excluir.", { type: "error" });
    } finally {
      setBusyId(null);
    }
  };

  const paginaAtual = Math.floor(offset / PAGE_SIZE) + 1;
  const totalPaginas = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const renderAdminActions = (item) => {
    if (!isAdmin) return null;
    const oculto = item.ativo === false;
    return (
      <div className="flex flex-wrap justify-end gap-1.5">
        {oculto ? (
          <button
            type="button"
            className={`${ADMIN_ACTION_CLASS} border-[rgba(34,197,94,0.45)] bg-[rgba(10,40,20,0.88)] text-[#86efac] hover:bg-green-700/70 hover:text-white`}
            disabled={busyId === item.id}
            onClick={(e) => {
              e.stopPropagation();
              desocultar(item.id);
            }}
            aria-label={`Desocultar ${item.torneioNome || "item"}`}
          >
            <Eye size={14} aria-hidden />
            Desocultar
          </button>
        ) : (
          <button
            type="button"
            className={`${ADMIN_ACTION_CLASS} border-[rgba(199,149,255,0.45)] bg-[rgba(14,9,28,0.88)] text-[#c4b5fd] hover:bg-[rgba(167,79,255,0.28)] hover:text-white`}
            disabled={busyId === item.id}
            onClick={(e) => {
              e.stopPropagation();
              ocultar(item.id);
            }}
            aria-label={`Ocultar ${item.torneioNome || "item"}`}
          >
            <EyeOff size={14} aria-hidden />
            Ocultar
          </button>
        )}
        <button
          type="button"
          className={`${ADMIN_ACTION_CLASS} border-red-400/50 bg-[rgba(80,10,20,0.88)] text-red-200 hover:bg-red-700/80 hover:text-white`}
          disabled={busyId === item.id}
          onClick={(e) => {
            e.stopPropagation();
            excluir(item.id);
          }}
          aria-label={`Excluir ${item.torneioNome || "item"}`}
        >
          <Trash2 size={14} aria-hidden />
          Excluir
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0e091c] text-[#e8dfff]">
      <LandingHeader />

      <section className="max-w-4xl mx-auto px-4 pt-28 pb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Hall da Fama</h1>
        <p className="text-[#9b8dc0] max-w-2xl mx-auto">
          Compilado das imagens de Top 8 dos torneios Fuguete — do mais recente ao mais antigo.
        </p>
        <p className="mt-4">
          <Link to="/torneios" className="text-brand font-semibold hover:underline">
            Participe dos torneios FREE
          </Link>
        </p>
      </section>

      <div className="max-w-5xl mx-auto px-4 pb-4">
        <AdSenseUnit unit="topBanner" className="w-full min-h-[50px]" />
      </div>

      <section className="max-w-6xl mx-auto px-4 pb-16">
        {loading ? (
          <SkeletonHallDaFama />
        ) : itens.length === 0 ? (
          <p className="text-center text-[#9b8dc0] py-12">
            Ainda não há Top 8 publicados. Finalize um torneio e publique a story no Hall.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {itens.map((item) => {
              const oculto = item.ativo === false;
              return (
                <article
                  key={item.id}
                  className={`group relative rounded-xl overflow-hidden border transition-all ${
                    oculto
                      ? "border-dashed border-[rgba(148,163,184,0.45)] bg-[rgba(148,163,184,0.08)] opacity-75"
                      : "border-line-soft bg-[rgba(167,79,255,0.08)] hover:border-[rgba(199,149,255,0.4)]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setLightbox(item)}
                    className="block w-full text-left cursor-pointer"
                  >
                    <div className="relative">
                      <img
                        src={item.imagemUrl}
                        alt={item.torneioNome || "Top 8"}
                        className={`w-full aspect-[9/16] object-cover object-top group-hover:scale-[1.02] transition-transform duration-300 ${oculto ? "grayscale-[0.35]" : ""}`}
                        loading="lazy"
                      />
                      {oculto ? (
                        <span className="absolute bottom-2 left-2 rounded-full border border-[rgba(148,163,184,0.5)] bg-[rgba(14,9,28,0.85)] px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.06em] text-[#cbd5e1]">
                          Oculto
                        </span>
                      ) : null}
                    </div>
                    <div className="p-3">
                      <p className="m-0 font-semibold text-sm line-clamp-2">{item.torneioNome || "Torneio"}</p>
                      {(item.dataTorneio || item.criadoEm) ? (
                        <p className="m-0 mt-1 text-xs text-[#9b8dc0]">
                          {new Date(item.dataTorneio || item.criadoEm).toLocaleDateString("pt-BR")}
                        </p>
                      ) : null}
                    </div>
                  </button>

                  {isAdmin ? (
                    <div className="absolute top-2 right-2 z-10">
                      {renderAdminActions(item)}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}

        {totalPaginas > 1 ? (
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              type="button"
              className="px-4 py-2 rounded-lg border border-line text-sm disabled:opacity-40"
              disabled={offset <= 0 || loading}
              onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
            >
              Anterior
            </button>
            <span className="text-sm text-[#9b8dc0]">
              {paginaAtual} / {totalPaginas}
            </span>
            <button
              type="button"
              className="px-4 py-2 rounded-lg border border-line text-sm disabled:opacity-40"
              disabled={offset + PAGE_SIZE >= total || loading}
              onClick={() => setOffset((o) => o + PAGE_SIZE)}
            >
              Próxima
            </button>
          </div>
        ) : null}
      </section>

      {lightbox ? (
        <div
          className="fixed inset-0 z-[200] bg-black/85 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Preview Top 8"
        >
          <div className="max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightbox.imagemUrl}
              alt={lightbox.torneioNome || "Top 8"}
              className={`w-full rounded-xl ${lightbox.ativo === false ? "grayscale-[0.35] opacity-80" : ""}`}
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <p className="m-0 font-semibold">
                {lightbox.torneioNome}
                {lightbox.ativo === false ? (
                  <span className="ml-2 text-xs font-bold uppercase tracking-wide text-[#cbd5e1]">(oculto)</span>
                ) : null}
              </p>
              {lightbox.torneioId ? (
                <Link
                  to={tournamentPath({ id: lightbox.torneioId, nome: lightbox.torneioNome })}
                  className="text-brand text-sm font-semibold hover:underline"
                >
                  Ver torneio
                </Link>
              ) : null}
            </div>
            {isAdmin ? (
              <div className="mt-3">
                {renderAdminActions(lightbox)}
              </div>
            ) : null}
            <button
              type="button"
              className="mt-4 w-full py-2 rounded-lg border border-line text-sm"
              onClick={() => setLightbox(null)}
            >
              Fechar
            </button>
          </div>
        </div>
      ) : null}

      <Footer />
      <CookieConsentBanner />
    </div>
  );
}
