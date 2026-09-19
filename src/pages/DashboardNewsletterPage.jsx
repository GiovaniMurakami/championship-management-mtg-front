import { useEffect, useState } from "react";
import { PageShell } from "../components/ui/PageShell";
import { Spinner } from "../components/ui/Spinner";
import { InlineAlert } from "../components/ui/InlineAlert";
import { useAuth } from "../hooks/useAuth";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { usePageTitle } from "../hooks/usePageTitle";
import { PAGE_TITLES } from "../constants/pageTitles";
import { listarAssinantesNewsletter } from "../services/backendApi";
import { TOURNAMENT_INPUT_CLASS, BTN_SECONDARY } from "../styles/uiClasses";

const LIMITE = 40;

export function DashboardNewsletterPage() {
  const { token } = useAuth();
  usePageTitle(PAGE_TITLES.dashboardNewsletter);

  const [search, setSearch] = useState("");
  const [pagina, setPagina] = useState(1);
  const [assinantes, setAssinantes] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);

  useEffect(() => {
    setPagina(1);
  }, [debouncedSearch]);

  useEffect(() => {
    if (!token) return undefined;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await listarAssinantesNewsletter(token, {
          nome: debouncedSearch.trim() || undefined,
          limite: LIMITE,
          offset: (pagina - 1) * LIMITE,
        });
        if (cancelled) return;
        setAssinantes(data?.assinantes ?? []);
        setTotal(Number(data?.total) || 0);
      } catch (err) {
        if (cancelled) return;
        setError(err.message || "Não foi possível carregar os assinantes.");
        setAssinantes([]);
        setTotal(0);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [token, debouncedSearch, pagina]);

  const totalPaginas = Math.max(1, Math.ceil(total / LIMITE));

  return (
    <PageShell className="mx-auto max-w-4xl px-4 pb-16 pt-28">
      <header className="mb-6">
        <p className="m-0 text-[0.75rem] font-bold uppercase tracking-[0.1em] text-text-subtle">
          Dashboard
        </p>
        <h1 className="m-0 mt-1 font-['Bebas_Neue',sans-serif] text-[2.2rem] tracking-[0.04em] text-white">
          Newsletter de metagame
        </h1>
        <p className="m-0 mt-2 max-w-2xl text-[0.95rem] leading-6 text-text-soft">
          Usuários que aceitaram receber o e-mail semanal com o resumo do metagame.
        </p>
      </header>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <label className="block min-w-0 flex-1 text-[0.8rem] font-semibold text-[#d9d6ff]">
          Buscar por nome ou e-mail
          <input
            type="search"
            className={`${TOURNAMENT_INPUT_CLASS} mt-1`}
            placeholder="Ex.: João ou joao@email.com"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoComplete="off"
          />
        </label>
        <div className="rounded-xl border border-line bg-black/20 px-4 py-3 text-center">
          <div className="text-2xl font-bold text-text-main">{total}</div>
          <div className="text-[0.7rem] font-semibold uppercase tracking-wide text-text-muted">Assinantes</div>
        </div>
      </div>

      {error ? <InlineAlert type="error" className="mb-4">{error}</InlineAlert> : null}

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : assinantes.length === 0 ? (
        <p className="text-text-soft">Nenhum assinante encontrado.</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line-soft">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-white/[0.03] text-[0.72rem] uppercase tracking-[0.08em] text-text-muted">
              <tr>
                <th className="px-4 py-3 font-bold">Nome</th>
                <th className="px-4 py-3 font-bold">E-mail</th>
                <th className="px-4 py-3 font-bold">Papel</th>
              </tr>
            </thead>
            <tbody>
              {assinantes.map((u) => (
                <tr key={u.id} className="border-t border-line-soft">
                  <td className="px-4 py-3 font-semibold text-text-main">{u.nome}</td>
                  <td className="px-4 py-3 text-text-soft">{u.email}</td>
                  <td className="px-4 py-3 text-text-muted">{u.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPaginas > 1 && (
        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            type="button"
            className={BTN_SECONDARY}
            disabled={pagina <= 1}
            onClick={() => setPagina((p) => Math.max(1, p - 1))}
          >
            Anterior
          </button>
          <span className="text-sm text-text-muted">
            Página {pagina} de {totalPaginas}
          </span>
          <button
            type="button"
            className={BTN_SECONDARY}
            disabled={pagina >= totalPaginas}
            onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
          >
            Próxima
          </button>
        </div>
      )}
    </PageShell>
  );
}
