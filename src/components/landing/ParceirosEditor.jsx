import { useEffect, useState } from "react";
import { FormFeedback } from "../ui/FormFeedback";
import { Switch } from "../ui/Switch";
import { Spinner } from "../ui/Spinner";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../context/ToastContext";
import { buscarParceirosAdmin, salvarParceiros } from "../../services/backendApi";
import { uploadBannerImage, validateBannerImageFile } from "../../utils/bannerUpload";
import { BTN_PRIMARY, BTN_SECONDARY, BTN_DANGER, MODAL_INPUT_CLASS, FORM_LABEL_CLASS } from "../../styles/uiClasses";

function parceiroVazio(ordem = 0) {
  return {
    id: undefined,
    nome: "",
    logoUrl: "",
    linkUrl: "",
    cupom: "",
    ativo: true,
    ordem,
  };
}

/** Formulário de parceiros — reutilizado no dashboard e no modal da landing. */
export function ParceirosEditor({ onSaved, showHeader = false }) {
  const { token, isAdmin } = useAuth();
  const { addToast } = useToast();

  const [parceiros, setParceiros] = useState([parceiroVazio(0)]);
  const [cupomGlobal, setCupomGlobal] = useState("FUGUETE05");
  const [paginaTitulo, setPaginaTitulo] = useState("");
  const [paginaTexto, setPaginaTexto] = useState("");
  const [ctaTitulo, setCtaTitulo] = useState("");
  const [ctaTexto, setCtaTexto] = useState("");
  const [contatoEmail, setContatoEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return undefined;
    let cancelled = false;
    setLoading(true);
    buscarParceirosAdmin(token)
      .then((data) => {
        if (cancelled) return;
        const lista = Array.isArray(data?.parceiros) ? data.parceiros : [];
        setParceiros(lista.length > 0 ? lista.map((p, i) => ({
          id: p.id,
          nome: p.nome || "",
          logoUrl: p.logoUrl || "",
          linkUrl: p.linkUrl || "",
          cupom: p.cupom || "",
          ativo: p.ativo !== false,
          ordem: Number.isFinite(p.ordem) ? p.ordem : i,
        })) : [parceiroVazio(0)]);
        setCupomGlobal(data?.cupomGlobal || "");
        setPaginaTitulo(data?.paginaTitulo || "");
        setPaginaTexto(data?.paginaTexto || "");
        setCtaTitulo(data?.ctaTitulo || "");
        setCtaTexto(data?.ctaTexto || "");
        setContatoEmail(data?.contatoEmail || "");
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Não foi possível carregar os parceiros.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [token]);

  const atualizar = (index, patch) => {
    setParceiros((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const handleUpload = async (index, file) => {
    const validationError = validateBannerImageFile(file, { isAdmin });
    if (validationError) {
      setError(validationError.userMessage || validationError.message);
      return;
    }
    setUploadingIndex(index);
    setError("");
    try {
      const url = await uploadBannerImage(file, token, undefined, { isAdmin, profile: "foto" });
      atualizar(index, { logoUrl: url });
      setMessage("Logo enviada.");
    } catch (err) {
      setError(err.userMessage || err.message || "Falha ao enviar imagem.");
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!token) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const payload = {
        cupomGlobal: cupomGlobal.trim(),
        paginaTitulo: paginaTitulo.trim(),
        paginaTexto: paginaTexto.trim(),
        ctaTitulo: ctaTitulo.trim(),
        ctaTexto: ctaTexto.trim(),
        contatoEmail: contatoEmail.trim(),
        parceiros: parceiros.map((p, index) => ({
          id: p.id,
          nome: p.nome.trim(),
          logoUrl: p.logoUrl.trim(),
          linkUrl: p.linkUrl.trim(),
          cupom: p.cupom.trim(),
          ativo: Boolean(p.ativo),
          ordem: index,
        })),
      };
      const response = await salvarParceiros(payload, token);
      const lista = Array.isArray(response?.parceiros) ? response.parceiros : [];
      setParceiros(lista.map((p, i) => ({
        id: p.id,
        nome: p.nome || "",
        logoUrl: p.logoUrl || "",
        linkUrl: p.linkUrl || "",
        cupom: p.cupom || "",
        ativo: p.ativo !== false,
        ordem: Number.isFinite(p.ordem) ? p.ordem : i,
      })));
      setCupomGlobal(response?.cupomGlobal || "");
      setPaginaTitulo(response?.paginaTitulo || "");
      setPaginaTexto(response?.paginaTexto || "");
      setCtaTitulo(response?.ctaTitulo || "");
      setCtaTexto(response?.ctaTexto || "");
      setContatoEmail(response?.contatoEmail || "");
      setMessage("Parceiros salvos.");
      addToast("Parceiros atualizados.", { type: "success" });
      onSaved?.(response);
    } catch (err) {
      setError(err.message || "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-10"><Spinner /></div>;
  }

  return (
    <form onSubmit={handleSave} className="space-y-5">
      {showHeader ? (
        <header>
          <h2 className="m-0 text-lg font-bold text-text-main">Parceiros</h2>
          <p className="m-0 mt-1 text-sm text-text-soft">Logos da home e de /parceiros.</p>
        </header>
      ) : null}

      <div className="space-y-3 rounded-2xl border border-line-soft bg-surface/40 p-4">
        <h3 className="m-0 text-sm font-bold text-text-main">Textos da página /parceiros</h3>
        <div>
          <label className={FORM_LABEL_CLASS} htmlFor="pagina-titulo">Título</label>
          <input id="pagina-titulo" value={paginaTitulo} onChange={(e) => setPaginaTitulo(e.target.value)} className={MODAL_INPUT_CLASS} maxLength={200} />
        </div>
        <div>
          <label className={FORM_LABEL_CLASS} htmlFor="pagina-texto">Texto introdutório</label>
          <textarea id="pagina-texto" value={paginaTexto} onChange={(e) => setPaginaTexto(e.target.value)} className={`${MODAL_INPUT_CLASS} min-h-[4.5rem]`} maxLength={800} />
        </div>
        <div>
          <label className={FORM_LABEL_CLASS} htmlFor="cta-titulo">Título do CTA</label>
          <input id="cta-titulo" value={ctaTitulo} onChange={(e) => setCtaTitulo(e.target.value)} className={MODAL_INPUT_CLASS} maxLength={160} />
        </div>
        <div>
          <label className={FORM_LABEL_CLASS} htmlFor="cta-texto">Texto do CTA</label>
          <textarea id="cta-texto" value={ctaTexto} onChange={(e) => setCtaTexto(e.target.value)} className={`${MODAL_INPUT_CLASS} min-h-[3.5rem]`} maxLength={400} />
        </div>
        <div>
          <label className={FORM_LABEL_CLASS} htmlFor="contato-email">E-mail de contato</label>
          <input id="contato-email" type="email" value={contatoEmail} onChange={(e) => setContatoEmail(e.target.value)} className={MODAL_INPUT_CLASS} maxLength={120} />
        </div>
        <div>
          <label className={FORM_LABEL_CLASS} htmlFor="cupom-global">Cupom global</label>
          <input
            id="cupom-global"
            value={cupomGlobal}
            onChange={(e) => setCupomGlobal(e.target.value)}
            className={MODAL_INPUT_CLASS}
            placeholder="FUGUETE05"
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <h3 className="m-0 text-sm font-bold text-text-main">Logos</h3>
        <button
          type="button"
          className={BTN_SECONDARY}
          onClick={() => setParceiros((prev) => [...prev, parceiroVazio(prev.length)])}
        >
          + Adicionar parceiro
        </button>
      </div>

      {parceiros.map((parceiro, index) => {
        const uploading = uploadingIndex === index;
        return (
          <div
            key={parceiro.id || `novo-${index}`}
            className="grid gap-4 rounded-2xl border border-line-soft bg-surface/60 p-4 lg:grid-cols-[1.1fr_0.9fr]"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <h3 className="m-0 text-base font-bold text-text-main">Parceiro {index + 1}</h3>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={Boolean(parceiro.ativo)}
                    onCheckedChange={(checked) => atualizar(index, { ativo: checked })}
                    label={parceiro.ativo ? "Ativo" : "Inativo"}
                  />
                  {parceiros.length > 1 ? (
                    <button
                      type="button"
                      className={BTN_DANGER}
                      onClick={() => setParceiros((prev) => prev.filter((_, i) => i !== index))}
                    >
                      Remover
                    </button>
                  ) : null}
                </div>
              </div>

              {[
                ["nome", "Nome", "text"],
                ["linkUrl", "Link", "url"],
                ["cupom", "Cupom (opcional)", "text"],
                ["logoUrl", "URL do logo", "url"],
              ].map(([field, label, type]) => (
                <div key={field}>
                  <label className={FORM_LABEL_CLASS} htmlFor={`parceiro-${field}-${index}`}>{label}</label>
                  <div className={field === "logoUrl" ? "flex flex-wrap gap-2" : ""}>
                    <input
                      id={`parceiro-${field}-${index}`}
                      type={type}
                      value={parceiro[field]}
                      onChange={(e) => atualizar(index, { [field]: e.target.value })}
                      className={`${MODAL_INPUT_CLASS} ${field === "logoUrl" ? "min-w-0 flex-1" : ""}`}
                      required={field === "nome"}
                    />
                    {field === "logoUrl" ? (
                      <>
                        <label
                          htmlFor={`upload-parceiro-${index}`}
                          className={`${BTN_SECONDARY} inline-flex cursor-pointer items-center px-3 ${uploading ? "pointer-events-none opacity-60" : ""}`}
                        >
                          {uploading ? "Enviando…" : "Upload"}
                        </label>
                        <input
                          id={`upload-parceiro-${index}`}
                          type="file"
                          accept="image/jpeg,image/png,image/gif,image/webp"
                          className="hidden"
                          disabled={uploading}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            e.target.value = "";
                            if (file) handleUpload(index, file);
                          }}
                        />
                      </>
                    ) : null}
                  </div>
                  {field === "logoUrl" ? (
                    <p className="m-0 mt-1.5 text-[0.75rem] text-text-muted">
                      Ideal: 800 × 400 px (proporção 2:1) ou 512 × 512 px (quadrado), fundo transparente.
                    </p>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center rounded-xl border border-line bg-black/20 p-4">
              {parceiro.logoUrl ? (
                <img src={parceiro.logoUrl} alt={parceiro.nome || "Logo"} className="max-h-20 max-w-full object-contain" />
              ) : (
                <span className="text-sm text-text-muted">Sem logo</span>
              )}
            </div>
          </div>
        );
      })}

      {message ? <FormFeedback message={message} /> : null}
      {error ? <FormFeedback message={error} variant="error" /> : null}

      <div className="flex justify-end sticky bottom-0 bg-surface/95 py-2">
        <button type="submit" className={BTN_PRIMARY} disabled={saving || uploadingIndex !== null}>
          {saving ? "Salvando..." : "Salvar parceiros"}
        </button>
      </div>
    </form>
  );
}
