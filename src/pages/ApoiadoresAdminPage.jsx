import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LandingHeader } from "../components/ui/LandingHeader";
import { Footer } from "../components";
import { DeleteConfirmModal } from "../components/ui/DeleteConfirmModal";
import { FormField } from "../components/ui/FormField";
import { InlineAlert } from "../components/ui/InlineAlert";
import { Spinner } from "../components/ui/Spinner";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { PAGE_TITLES } from "../constants/pageTitles";
import {
  alterarApoiador,
  criarApoiador,
  excluirApoiador,
  listarApoiadoresAdmin,
} from "../services/backendApi";
import { BLOG_EDITOR_CARD_CLASS, BTN_PRIMARY, BTN_SECONDARY } from "../styles/uiClasses";

const emptyForm = {
  nome: "",
  ordem: 0,
  ativo: true,
};

export function ApoiadoresAdminPage() {
  usePageTitle(PAGE_TITLES.gerenciarApoiadores);
  const { token } = useAuth();
  const { addToast } = useToast();
  const [apoiadores, setApoiadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const carregar = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const data = await listarApoiadoresAdmin(token);
      setApoiadores(data.apoiadores || []);
    } catch {
      setError("Não foi possível carregar os apoiadores.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleEdit = (apoiador) => {
    setEditingId(apoiador.id);
    setForm({
      nome: apoiador.nome || "",
      ordem: apoiador.ordem ?? 0,
      ativo: apoiador.ativo ?? true,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!token || saving) return;

    if (!form.nome.trim()) {
      setError("Informe o nome do apoiador.");
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      nome: form.nome.trim(),
      ordem: Number(form.ordem) || 0,
      ativo: form.ativo,
    };

    try {
      if (editingId) {
        await alterarApoiador(editingId, payload, token);
        addToast("Apoiador atualizado.", { type: "success" });
      } else {
        await criarApoiador(payload, token);
        addToast("Apoiador criado.", { type: "success" });
      }
      resetForm();
      await carregar();
    } catch (err) {
      setError(err?.message || "Não foi possível salvar o apoiador.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (_confirmName, closeModal) => {
    if (!token || !deleteTarget || deleting) return;
    setDeleting(true);
    try {
      await excluirApoiador(deleteTarget.id, token);
      addToast("Apoiador excluído.", { type: "success" });
      closeModal?.();
      setDeleteTarget(null);
      if (editingId === deleteTarget.id) resetForm();
      await carregar();
    } catch (err) {
      addToast(err?.message || "Não foi possível excluir o apoiador.", { type: "error" });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0e091c] text-[#e8dfff]">
      <LandingHeader />

      <section className="mx-auto max-w-6xl px-4 pt-28 pb-12">
        <Link to="/landing/admin" className="mb-4 inline-flex text-sm text-[#c795ff] underline underline-offset-2">
          ← Gerenciar landing
        </Link>

        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#f5edff]">Apoiadores</h1>
            <p className="mt-2 text-[#9b8dc0]">Somente o nome é exibido na página Sobre mim.</p>
          </div>
          <Link to="/sobre-mim" className={`${BTN_SECONDARY} no-underline text-sm`}>
            Ver página pública
          </Link>
        </div>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,360px)_1fr]">
          <section className={BLOG_EDITOR_CARD_CLASS}>
            <h2 className="mb-4 text-lg font-bold text-[#f5edff]">
              {editingId ? "Editar apoiador" : "Novo apoiador"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField
                id="nome"
                label="Nome"
                value={form.nome}
                onChange={(event) => setForm((current) => ({ ...current, nome: event.target.value }))}
                required
                size="page"
              />
              <FormField
                id="ordem"
                label="Ordem"
                type="number"
                value={String(form.ordem)}
                onChange={(event) => setForm((current) => ({ ...current, ordem: event.target.value }))}
                size="page"
              />
              <label className="flex items-center gap-3 text-sm text-[#d8cff0]">
                <input
                  type="checkbox"
                  checked={form.ativo}
                  onChange={(event) => setForm((current) => ({ ...current, ativo: event.target.checked }))}
                  className="h-4 w-4 accent-[#8e39ed]"
                />
                Exibir na página
              </label>
              {error ? <InlineAlert type="error">{error}</InlineAlert> : null}
              <div className="flex flex-wrap gap-3">
                <button type="submit" className={BTN_PRIMARY} disabled={saving}>
                  {saving ? "Salvando..." : editingId ? "Salvar alterações" : "Adicionar apoiador"}
                </button>
                {editingId ? (
                  <button type="button" className={BTN_SECONDARY} onClick={resetForm} disabled={saving}>
                    Cancelar edição
                  </button>
                ) : null}
              </div>
            </form>
          </section>

          <section className={BLOG_EDITOR_CARD_CLASS}>
            <h2 className="mb-4 text-lg font-bold text-[#f5edff]">
              Apoiadores cadastrados ({apoiadores.length})
            </h2>
            {loading ? <Spinner text="Carregando apoiadores..." /> : null}
            {!loading && apoiadores.length === 0 ? (
              <p className="text-[#9b8dc0]">Nenhum apoiador cadastrado.</p>
            ) : null}
            <div className="max-h-[640px] space-y-2 overflow-y-auto">
              {apoiadores.map((apoiador) => (
                <div
                  key={apoiador.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[rgba(217,180,255,0.12)] bg-[#120b24] px-4 py-3"
                >
                  <div>
                    <p className="m-0 font-medium text-[#f5edff]">{apoiador.nome}</p>
                    <p className="m-0 text-xs text-[#8f82ad]">
                      Ordem {apoiador.ordem} · {apoiador.ativo ? "Ativo" : "Inativo"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" className={BTN_SECONDARY} onClick={() => handleEdit(apoiador)}>
                      Editar
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-[rgba(248,113,113,0.35)] px-3 py-2 text-sm font-semibold text-[#fca5a5]"
                      onClick={() => setDeleteTarget(apoiador)}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>

      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Excluir apoiador"
        message={`Excluir "${deleteTarget?.nome}"?`}
        confirmLabel="Excluir"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <Footer />
    </div>
  );
}
