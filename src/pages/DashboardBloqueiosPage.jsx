import { useEffect, useState } from "react";
import { PageShell } from "../components/ui/PageShell";
import { Spinner } from "../components/ui/Spinner";
import { InlineAlert } from "../components/ui/InlineAlert";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { usePageTitle } from "../hooks/usePageTitle";
import { PAGE_TITLES } from "../constants/pageTitles";
import { alterarBloqueioTorneios, listarUsuarios } from "../services/backendApi";
import { BTN_DANGER, BTN_SECONDARY, TOURNAMENT_INPUT_CLASS } from "../styles/uiClasses";

const LIMITE = 40;

export function DashboardBloqueiosPage() {
  const { token } = useAuth();
  const { addToast } = useToast();
  usePageTitle(PAGE_TITLES.dashboardBloqueios);

  const [search, setSearch] = useState("");
  const [filtroBloqueados, setFiltroBloqueados] = useState("todos");
  const [pagina, setPagina] = useState(1);
  const [usuarios, setUsuarios] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mutatingId, setMutatingId] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);

  useEffect(() => {
    setPagina(1);
  }, [debouncedSearch, filtroBloqueados]);

  useEffect(() => {
    if (!token) return undefined;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const params = {
          nome: debouncedSearch.trim() || undefined,
          limite: LIMITE,
          offset: (pagina - 1) * LIMITE,
        };
        if (filtroBloqueados === "bloqueados") params.bloqueadoTorneios = true;
        if (filtroBloqueados === "ativos") params.bloqueadoTorneios = false;

        const data = await listarUsuarios(token, params);
        if (cancelled) return;
        setUsuarios(data?.usuarios ?? []);
        setTotal(Number(data?.total) || 0);
      } catch (err) {
        if (cancelled) return;
        setError(err.message || "Não foi possível carregar os usuários.");
        setUsuarios([]);
        setTotal(0);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [token, debouncedSearch, filtroBloqueados, pagina]);

  const totalPaginas = Math.max(1, Math.ceil(total / LIMITE));

  const handleToggle = async (usuario) => {
    if (!token || mutatingId) return;
    const proximoBloqueio = !usuario.bloqueadoTorneios;
    setMutatingId(usuario.id);
    try {
      const resultado = await alterarBloqueioTorneios(
        usuario.id,
        { bloqueado: proximoBloqueio },
        token,
      );
      setUsuarios((atual) =>
        atual.map((item) =>
          item.id === usuario.id
            ? { ...item, bloqueadoTorneios: resultado.bloqueadoTorneios }
            : item,
        ),
      );
      if (proximoBloqueio) {
        const removidas = resultado.inscricoesRemovidas ?? 0;
        addToast(
          removidas > 0
            ? `${usuario.nome} bloqueado. ${removidas} inscrição(ões) removida(s) de torneios abertos.`
            : `${usuario.nome} bloqueado para novos torneios.`,
          { type: "success" },
        );
      } else {
        addToast(`${usuario.nome} desbloqueado.`, { type: "success" });
      }
    } catch (err) {
      addToast(err.message || "Não foi possível atualizar o bloqueio.", { type: "error" });
    } finally {
      setMutatingId("");
    }
  };

  return (
    <PageShell className="mx-auto max-w-4xl px-4 pb-16 pt-28">
      <header className="mb-6">
        <p className="m-0 text-[0.75rem] font-bold uppercase tracking-[0.1em] text-text-subtle">
          Dashboard
        </p>
        <h1 className="m-0 mt-1 font-['Bebas_Neue',sans-serif] text-[2.2rem] tracking-[0.04em] text-white">
          Bloqueio de usuários
        </h1>
        <p className="m-0 mt-2 max-w-2xl text-[0.95rem] leading-6 text-text-soft">
          Bloqueados não podem se inscrever nem ingressar em torneios. Ao bloquear, a inscrição
          é removida apenas de torneios com status &quot;inscrições abertas&quot;.
        </p>
      </header>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
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
        <label className="block text-[0.8rem] font-semibold text-[#d9d6ff] sm:w-48">
          Filtro
          <select
            className={`${TOURNAMENT_INPUT_CLASS} mt-1`}
            value={filtroBloqueados}
            onChange={(e) => setFiltroBloqueados(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="bloqueados">Somente bloqueados</option>
            <option value="ativos">Somente ativos</option>
          </select>
        </label>
      </div>

      {error ? <InlineAlert type="error" className="mb-4">{error}</InlineAlert> : null}

      <div className="overflow-hidden rounded-2xl border border-line-soft bg-[rgba(14,9,28,0.55)]">
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner text="Buscando usuários..." />
          </div>
        ) : usuarios.length === 0 ? (
          <p className="m-0 px-4 py-10 text-center text-sm text-text-muted">
            Nenhum usuário encontrado.
          </p>
        ) : (
          <ul className="m-0 list-none divide-y divide-[rgba(217,180,255,0.1)] p-0">
            {usuarios.map((usuario) => {
              const bloqueado = Boolean(usuario.bloqueadoTorneios);
              const busy = mutatingId === usuario.id;
              return (
                <li
                  key={usuario.id}
                  className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="m-0 truncate text-[0.98rem] font-semibold text-text-main">
                        {usuario.nome}
                      </p>
                      {bloqueado && (
                        <span className="rounded-md border border-[rgba(252,88,119,0.4)] bg-[rgba(252,88,119,0.12)] px-2 py-0.5 text-[0.68rem] font-bold uppercase tracking-[0.06em] text-[#ffa8b8]">
                          Bloqueado
                        </span>
                      )}
                    </div>
                    <p className="m-0 mt-0.5 truncate text-[0.82rem] text-text-soft">{usuario.email}</p>
                    {(usuario.nickMTGO || usuario.nickArena) && (
                      <p className="m-0 mt-1 text-[0.75rem] text-text-muted">
                        {[usuario.nickMTGO && `MTGO: ${usuario.nickMTGO}`, usuario.nickArena && `Arena: ${usuario.nickArena}`]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    className={bloqueado ? BTN_SECONDARY : BTN_DANGER}
                    disabled={busy || Boolean(mutatingId)}
                    onClick={() => handleToggle(usuario)}
                  >
                    {busy ? "Salvando..." : bloqueado ? "Desbloquear" : "Bloquear"}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {!loading && total > LIMITE && (
        <nav className="mt-4 flex items-center justify-center gap-3" aria-label="Paginação de usuários">
          <button
            type="button"
            onClick={() => setPagina((p) => Math.max(1, p - 1))}
            disabled={pagina === 1}
            aria-label="Página anterior"
            className="px-3 py-2 border border-line rounded-lg text-text-soft text-[0.85rem] disabled:opacity-40 hover:border-[rgba(199,149,255,0.4)] hover:text-white transition-colors"
          >
            ←
          </button>
          <span className="text-text-soft text-[0.85rem] min-w-[60px] text-center" aria-live="polite">
            {pagina} / {totalPaginas}
          </span>
          <button
            type="button"
            onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
            disabled={pagina === totalPaginas}
            aria-label="Próxima página"
            className="px-3 py-2 border border-line rounded-lg text-text-soft text-[0.85rem] disabled:opacity-40 hover:border-[rgba(199,149,255,0.4)] hover:text-white transition-colors"
          >
            →
          </button>
        </nav>
      )}
    </PageShell>
  );
}
