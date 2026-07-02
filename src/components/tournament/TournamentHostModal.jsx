import { useEffect, useState } from "react";
import { BaseModal } from "../ui/BaseModal";
import { Spinner } from "../ui/Spinner";
import { listarUsuarios } from "../../services/backendApi";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { BTN_GHOST, BTN_PRIMARY, MODAL_INPUT_CLASS } from "../../styles/uiClasses";

export function TournamentHostModal({
  isOpen,
  onClose,
  torneio,
  token,
  onSubmit,
  loading,
}) {
  const [search, setSearch] = useState("");
  const [usuarios, setUsuarios] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(torneio?.anfitriaoId || "");
  const debouncedSearch = useDebouncedValue(search, 300);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedId(torneio?.anfitriaoId || "");
    setSearch("");
    setError("");
  }, [isOpen, torneio?.anfitriaoId]);

  useEffect(() => {
    if (!isOpen || !token) return undefined;

    let cancelled = false;

    const loadUsuarios = async () => {
      setFetching(true);
      setError("");
      try {
        const data = await listarUsuarios(token, {
          nome: debouncedSearch.trim() || undefined,
          limite: 20,
        });
        if (cancelled) return;
        setUsuarios(data?.usuarios ?? []);
      } catch (err) {
        if (cancelled) return;
        setError(err.message || "Erro ao buscar usuários.");
        setUsuarios([]);
      } finally {
        if (!cancelled) setFetching(false);
      }
    };

    loadUsuarios();

    return () => {
      cancelled = true;
    };
  }, [isOpen, token, debouncedSearch]);

  const handleSubmit = async () => {
    await onSubmit(selectedId || null);
  };

  const handleRemove = async () => {
    await onSubmit(null);
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} ariaLabelledBy="host-modal-title">
      <div className="p-2">
        <h2 id="host-modal-title" className="m-0 mb-1 font-['Bebas_Neue',sans-serif] text-[1.6rem] tracking-[0.04em] text-white">
          Definir anfitrião
        </h2>
        <p className="m-0 mb-4 text-[0.88rem] text-[#beafd7]">
          O anfitrião terá permissões de administrador neste torneio.
        </p>

        {torneio?.anfitriao && (
          <div className="mb-4 rounded-xl border border-[rgba(199,149,255,0.35)] bg-[rgba(167,79,255,0.08)] px-3 py-2">
            <p className="m-0 text-[0.75rem] uppercase tracking-[0.08em] text-[#c795ff] font-semibold">Anfitrião atual</p>
            <p className="m-0 mt-1 text-[0.95rem] text-white font-medium">{torneio.anfitriao.nome}</p>
            <p className="m-0 text-[0.8rem] text-[#beafd7]">{torneio.anfitriao.email}</p>
          </div>
        )}

        <label className="block mb-2 text-[0.8rem] font-semibold text-[#d9d6ff]">
          Buscar usuário
          <input
            type="search"
            className={`${MODAL_INPUT_CLASS} mt-1`}
            placeholder="Nome do jogador..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoComplete="off"
          />
        </label>

        <div className="max-h-[240px] overflow-y-auto border border-[rgba(217,180,255,0.15)] rounded-xl mb-4">
          {fetching ? (
            <div className="flex justify-center py-8">
              <Spinner size="sm" />
            </div>
          ) : usuarios.length === 0 ? (
            <p className="m-0 px-3 py-6 text-center text-[0.85rem] text-[#8b7aab]">
              {error || "Nenhum usuário encontrado."}
            </p>
          ) : (
            <ul className="m-0 p-0 list-none">
              {usuarios.map((usuario) => {
                const isSelected = selectedId === usuario.id;
                return (
                  <li key={usuario.id}>
                    <button
                      type="button"
                      className={`w-full text-left px-3 py-2.5 border-0 border-b border-[rgba(217,180,255,0.08)] cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-[rgba(167,79,255,0.18)] text-white"
                          : "bg-transparent text-[#f5edff] hover:bg-[rgba(255,255,255,0.04)]"
                      }`}
                      onClick={() => setSelectedId(usuario.id)}
                    >
                      <span className="block text-[0.92rem] font-medium">{usuario.nome}</span>
                      <span className="block text-[0.78rem] text-[#8b7aab]">{usuario.email}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex flex-wrap gap-2 justify-end">
          <button type="button" className={BTN_GHOST} onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          {torneio?.anfitriaoId && (
            <button type="button" className={BTN_GHOST} onClick={handleRemove} disabled={loading}>
              Remover anfitrião
            </button>
          )}
          <button
            type="button"
            className={BTN_PRIMARY}
            onClick={handleSubmit}
            disabled={loading || !selectedId || selectedId === torneio?.anfitriaoId}
          >
            {loading ? "Salvando..." : "Definir anfitrião"}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
