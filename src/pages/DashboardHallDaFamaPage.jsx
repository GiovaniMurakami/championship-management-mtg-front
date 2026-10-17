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
      const data = await listarHallDaFama({ limite: 100, offset: 0 });
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

  const ocultar = async (id) => {
    if (!token) return;
    setBusyId(id);
    try {
      await atualizarHallDaFama(id, { ativo: false }, token);
      setItens((prev) => prev.filter((item) => item.id !== id));
      addToast("Item ocultado do Hall.", { type: "success" });
    } catch (err) {
      addToast(err.message || "Falha ao ocultar.", { type: "error" });
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
        <p className="text-text-muted">Nenhum item ativo no Hall.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {itens.map((item) => (
            <article key={item.id} className="overflow-hidden rounded-xl border border-line-soft bg-surface/60">
              <img src={item.imagemUrl} alt={item.torneioNome || "Top 8"} className="aspect-[9/16] w-full object-cover object-top" />
              <div className="space-y-3 p-3">
                <div>
                  <p className="m-0 font-semibold text-sm">{item.torneioNome || "Torneio"}</p>
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
                    onClick={() => ocultar(item.id)}
                  >
                    Ocultar
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
          ))}
        </div>
      )}
    </PageShell>
  );
}
