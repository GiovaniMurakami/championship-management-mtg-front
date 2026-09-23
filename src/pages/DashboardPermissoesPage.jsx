import { useEffect, useMemo, useState } from "react";
import { PageShell } from "../components/ui/PageShell";
import { Spinner } from "../components/ui/Spinner";
import { InlineAlert } from "../components/ui/InlineAlert";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { usePageTitle } from "../hooks/usePageTitle";
import { PAGE_TITLES } from "../constants/pageTitles";
import { definirEditor, listarUsuarios } from "../services/backendApi";
import { BTN_PRIMARY, BTN_SECONDARY, TOURNAMENT_INPUT_CLASS } from "../styles/uiClasses";

const LIMITE = 40;

const ROLE_LABEL = {
  user: "Usuário",
  editor: "Editor",
  admin: "Admin",
};

function RoleBadge({ role }) {
  if (role === "admin") {
    return (
      <span className="rounded-md border border-line px-2 py-0.5 text-[0.68rem] font-bold uppercase tracking-[0.06em] text-text-muted">
        Admin
      </span>
    );
  }
  if (role === "editor") {
    return (
      <span className="rounded-md border border-[rgba(167,79,255,0.4)] bg-[rgba(167,79,255,0.12)] px-2 py-0.5 text-[0.68rem] font-bold uppercase tracking-[0.06em] text-[#d9b8ff]">
        Editor
      </span>
    );
  }
  return (
    <span className="rounded-md border border-line-soft px-2 py-0.5 text-[0.68rem] font-bold uppercase tracking-[0.06em] text-text-soft">
      Usuário
    </span>
  );
}

export function DashboardPermissoesPage() {
  const { token } = useAuth();
  const { addToast } = useToast();
  usePageTitle(PAGE_TITLES.dashboardPermissoes);

  const [search, setSearch] = useState("");
  const [filtroRole, setFiltroRole] = useState("todos");
  const [pagina, setPagina] = useState(1);
  const [usuarios, setUsuarios] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mutatingId, setMutatingId] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);

  useEffect(() => {
    setPagina(1);
  }, [debouncedSearch, filtroRole]);

  useEffect(() => {
    if (!token) return undefined;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await listarUsuarios(token, {
          nome: debouncedSearch.trim() || undefined,
          limite: LIMITE,
          offset: (pagina - 1) * LIMITE,
        });
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
  }, [token, debouncedSearch, pagina]);

  const usuariosFiltrados = useMemo(() => {
    const lista = [...usuarios].sort(
      (a, b) =>
        String(a?.nome || "").localeCompare(String(b?.nome || ""), "pt-BR", { sensitivity: "base" })
        || String(a?.email || "").localeCompare(String(b?.email || ""), "pt-BR", { sensitivity: "base" }),
    );
    if (filtroRole === "todos") return lista;
    return lista.filter((u) => (u.role || "user") === filtroRole);
  }, [usuarios, filtroRole]);

  const totalPaginas = Math.max(1, Math.ceil(total / LIMITE));

  const alterarPermissao = async (usuario, roleAlvo) => {
    if (!token || mutatingId || usuario.role === "admin") return;
    if ((usuario.role || "user") === roleAlvo) return;

    setMutatingId(usuario.id);
    try {
      const resultado = await definirEditor(usuario.id, roleAlvo === "editor", token);
      setUsuarios((atual) =>
        atual.map((item) =>
          item.id === usuario.id ? { ...item, role: resultado.role } : item,
        ),
      );
      addToast(
        `${usuario.nome} agora é ${ROLE_LABEL[resultado.role] || resultado.role}.`,
        { type: "success" },
      );
    } catch (err) {
      addToast(err.message || "Não foi possível atualizar a permissão.", { type: "error" });
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
          Permissões de usuários
        </h1>
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
          Papel
          <select
            className={`${TOURNAMENT_INPUT_CLASS} mt-1`}
            value={filtroRole}
            onChange={(e) => setFiltroRole(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="user">Usuários</option>
            <option value="editor">Editores</option>
            <option value="admin">Admins</option>
          </select>
        </label>
      </div>

      {error ? <InlineAlert type="error" className="mb-4">{error}</InlineAlert> : null}

      <div className="overflow-hidden rounded-2xl border border-line-soft bg-[rgba(14,9,28,0.55)]">
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner text="Buscando usuários..." />
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <p className="m-0 px-4 py-10 text-center text-sm text-text-muted">
            Nenhum usuário encontrado.
          </p>
        ) : (
          <ul className="m-0 list-none divide-y divide-[rgba(217,180,255,0.1)] p-0">
            {usuariosFiltrados.map((usuario) => {
              const role = usuario.role || "user";
              const busy = mutatingId === usuario.id;
              const ehAdmin = role === "admin";
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
                      <RoleBadge role={role} />
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

                  {ehAdmin ? (
                    <p className="m-0 text-sm text-text-muted shrink-0">Sem alteração</p>
                  ) : (
                    <div className="flex flex-wrap gap-2 shrink-0">
                      <button
                        type="button"
                        className={role === "user" ? BTN_PRIMARY : BTN_SECONDARY}
                        disabled={busy || Boolean(mutatingId) || role === "user"}
                        onClick={() => alterarPermissao(usuario, "user")}
                      >
                        {busy && role !== "user" ? "Salvando..." : "Usuário"}
                      </button>
                      <button
                        type="button"
                        className={role === "editor" ? BTN_PRIMARY : BTN_SECONDARY}
                        disabled={busy || Boolean(mutatingId) || role === "editor"}
                        onClick={() => alterarPermissao(usuario, "editor")}
                      >
                        {busy && role !== "editor" ? "Salvando..." : "Editor"}
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {!loading && total > LIMITE && filtroRole === "todos" && (
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
