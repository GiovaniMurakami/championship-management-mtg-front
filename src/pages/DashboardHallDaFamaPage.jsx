import { useEffect, useState } from "react";
import { PageShell } from "../components/ui/PageShell";
import { FormFeedback } from "../components/ui/FormFeedback";
import { SkeletonHallDaFama } from "../components/ui/Skeleton";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { PAGE_TITLES } from "../constants/pageTitles";
import { atualizarHallDaFama, excluirHallDaFama, listarHallDaFama } from "../services/backendApi";
import { BTN_DANGER, BTN_SECONDARY } from "../styles/uiClasses";

export function DashboardHallDaFamaPage() {
  const { token } = useAuth();
  const { addToast } = useToast();
  usePageTitle(PAGE_TITLES.dashboardHallDaFama);

  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  const carregar = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listarHallDaFama({ limite: 100, offset: 0, incluirInativos: true }, token);
      setItens(Array.isArray(data?.itens) ? data.itens : []);
    } catch (err) {
      setError(err.message || "Não foi possível carregar o Hall da Fama.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  const definirAtivo = async (id, ativo) => {
    if (!token) return;
    setBusyId(id);
    try {
      await atualizarHallDaFama(id, { ativo }, token);
      setItens((prev) => prev.map((item) => (item.id === id ? { ...item, ativo } : item)));
      addToast(ativo ? "Item visível novamente no Hall." : "Item ocultado do Hall.", { type: "success" });
    } catch (err) {
      addToast(err.message || (ativo ? "Falha ao desocultar." : "Falha ao ocultar."), { type: "error" });
    } finally {
      setBusyId(null);
    }
  };

  const excluir = async (id) => {
    if (!token) return;
    if (!window.confirm("Excluir permanentemente este Top 8 do Hall?")) return;
    setBusyId(id);
    try {
      await excluirHallDaFama(id, token);
      setItens((prev) => prev.filter((item) => item.id !== id));
      addToast("Item excluído.", { type: "success" });
    } catch (err) {
      addToast(err.message || "Falha ao excluir.", { type: "error" });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <PageShell className="mx-auto max-w-5xl px-4 pb-16 pt-28">
      <header className="mb-6">
        <p className="m-0 text-[0.75rem] font-bold uppercase tracking-[0.1em] text-text-subtle">Dashboard</p>
        <h1 className="m-0 mt-1 font-['Bebas_Neue',sans-serif] text-[2.2rem] tracking-[0.04em] text-white">
          Hall da Fama
        </h1>
        <p className="m-0 mt-2 max-w-2xl text-[0.95rem] leading-6 text-text-soft">
          Gerencie as imagens de Top 8 publicadas. Novas entradas vêm do botão &quot;Publicar no Hall&quot; na story do torneio.
        </p>
      </header>

      {error ? <FormFeedback message={error} variant="error" /> : null}

      {loading ? (
        <SkeletonHallDaFama />
      ) : itens.length === 0 ? (
        <p className="text-text-muted">Nenhum item no Hall.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {itens.map((item) => {
            const oculto = item.ativo === false;
            return (
              <article
                key={item.id}
                className={`overflow-hidden rounded-xl border bg-surface/60 ${
                  oculto ? "border-dashed border-[rgba(148,163,184,0.45)] opacity-80" : "border-line-soft"
                }`}
              >
                <img src={item.imagemUrl} alt={item.torneioNome || "Top 8"} className="aspect-[9/16] w-full object-cover object-top" />
                <div className="space-y-3 p-3">
                  <div>
                    <p className="m-0 font-semibold text-sm">
                      {item.torneioNome || "Torneio"}
                      {oculto ? <span className="ml-2 text-xs text-text-muted">(oculto)</span> : null}
                    </p>
                    {(item.dataTorneio || item.criadoEm) ? (
                      <p className="m-0 mt-1 text-xs text-text-muted">
                        {new Date(item.dataTorneio || item.criadoEm).toLocaleString("pt-BR")}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={BTN_SECONDARY}
                      disabled={busyId === item.id}
                      onClick={() => definirAtivo(item.id, oculto)}
                    >
                      {oculto ? "Desocultar" : "Ocultar"}
                    </button>
                    <button
                      type="button"
                      className={BTN_DANGER}
                      disabled={busyId === item.id}
                      onClick={() => excluir(item.id)}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
