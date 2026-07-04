import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LandingHeader } from "../components/ui/LandingHeader";
import { Footer } from "../components";
import { BlogCoverImageField } from "../components/blog/BlogCoverImageField";
import { DeleteConfirmModal } from "../components/ui/DeleteConfirmModal";
import { FormField } from "../components/ui/FormField";
import { InlineAlert } from "../components/ui/InlineAlert";
import { Spinner } from "../components/ui/Spinner";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { PAGE_TITLES } from "../constants/pageTitles";
import {
  alterarParceiro,
  criarParceiro,
  excluirParceiro,
  listarParceirosAdmin,
} from "../services/backendApi";
import { BLOG_EDITOR_CARD_CLASS, BTN_PRIMARY, BTN_SECONDARY } from "../styles/uiClasses";

const emptyForm = {
  nome: "",
  imagemUrl: "",
  linkUrl: "",
  ordem: 0,
  ativo: true,
};

export function ParceirosAdminPage() {
  usePageTitle(PAGE_TITLES.gerenciarParceiros);
  const { token } = useAuth();
  const { addToast } = useToast();
  const [parceiros, setParceiros] = useState([]);
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
      const data = await listarParceirosAdmin(token);
      setParceiros(data.parceiros || []);
    } catch {
      setError("Não foi possível carregar os parceiros.");
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

  const handleEdit = (parceiro) => {
    setEditingId(parceiro.id);
    setForm({
      nome: parceiro.nome || "",
      imagemUrl: parceiro.imagemUrl || "",
      linkUrl: parceiro.linkUrl || "",
      ordem: parceiro.ordem ?? 0,
      ativo: parceiro.ativo ?? true,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!token || saving) return;

    if (!form.nome.trim() || !form.imagemUrl.trim()) {
      setError("Informe nome e imagem do parceiro.");
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      nome: form.nome.trim(),
      imagemUrl: form.imagemUrl.trim(),
      linkUrl: form.linkUrl.trim() || undefined,
      ordem: Number(form.ordem) || 0,
      ativo: form.ativo,
    };

    try {
      if (editingId) {
        await alterarParceiro(editingId, payload, token);
        addToast("Parceiro atualizado.", { type: "success" });
      } else {
        await criarParceiro(payload, token);
        addToast("Parceiro criado.", { type: "success" });
      }
      resetForm();
      await carregar();
    } catch (err) {
      setError(err?.message || "Não foi possível salvar o parceiro.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (_confirmName, closeModal) => {
    if (!token || !deleteTarget || deleting) return;
    setDeleting(true);
    try {
      await excluirParceiro(deleteTarget.id, token);
      addToast("Parceiro excluído.", { type: "success" });
      closeModal?.();
      setDeleteTarget(null);
      if (editingId === deleteTarget.id) resetForm();
      await carregar();
    } catch (err) {
      addToast(err?.message || "Não foi possível excluir o parceiro.", { type: "error" });
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
            <h1 className="text-3xl font-bold text-[#f5edff]">Parceiros</h1>
            <p className="mt-2 text-[#9b8dc0]">Nome, imagem (S3) e link opcional.</p>
          </div>
          <Link to="/parceiros" className={`${BTN_SECONDARY} no-underline text-sm`}>
            Ver página pública
          </Link>
        </div>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,360px)_1fr]">
          <section className={BLOG_EDITOR_CARD_CLASS}>
            <h2 className="mb-4 text-lg font-bold text-[#f5edff]">
              {editingId ? "Editar parceiro" : "Novo parceiro"}
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
                id="linkUrl"
                label="Link (opcional)"
                value={form.linkUrl}
                onChange={(event) => setForm((current) => ({ ...current, linkUrl: event.target.value }))}
                placeholder="https://loja.com"
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
                Exibir na landing
              </label>
              <div>
                <span className="mb-2 block text-sm font-semibold text-[#d8cff0]">Logo / imagem</span>
                <BlogCoverImageField
                  value={form.imagemUrl}
                  onChange={(imagemUrl) => setForm((current) => ({ ...current, imagemUrl }))}
                  token={token}
                  disabled={saving}
                />
              </div>
              {error ? <InlineAlert type="error">{error}</InlineAlert> : null}
              <div className="flex flex-wrap gap-3">
                <button type="submit" className={BTN_PRIMARY} disabled={saving}>
                  {saving ? "Salvando..." : editingId ? "Salvar alterações" : "Adicionar parceiro"}
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
            <h2 className="mb-4 text-lg font-bold text-[#f5edff]">Parceiros cadastrados</h2>
            {loading ? <Spinner text="Carregando parceiros..." /> : null}
            {!loading && parceiros.length === 0 ? (
              <p className="text-[#9b8dc0]">Nenhum parceiro cadastrado.</p>
            ) : null}
            <div className="space-y-3">
              {parceiros.map((parceiro) => (
                <div
                  key={parceiro.id}
                  className="flex flex-wrap items-center gap-4 rounded-xl border border-[rgba(217,180,255,0.12)] bg-[#120b24] p-4"
                >
                  <img
                    src={parceiro.imagemUrl}
                    alt={parceiro.nome}
                    className="h-14 w-20 rounded-lg object-contain bg-[#0f0a1f]"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="m-0 font-semibold text-[#f5edff]">{parceiro.nome}</p>
                    <p className="m-0 text-xs text-[#8f82ad]">
                      Ordem {parceiro.ordem} · {parceiro.ativo ? "Ativo" : "Inativo"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className={BTN_SECONDARY} onClick={() => handleEdit(parceiro)}>
                      Editar
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-[rgba(248,113,113,0.35)] px-3 py-2 text-sm font-semibold text-[#fca5a5]"
                      onClick={() => setDeleteTarget(parceiro)}
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
        title="Excluir parceiro"
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
