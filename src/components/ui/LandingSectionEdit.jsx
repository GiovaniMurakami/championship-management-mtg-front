import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { BaseModal } from "./BaseModal";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../context/ToastContext";
import { salvarConteudoHome } from "../../services/backendApi";
import { SlidesHomeEditor } from "../landing/SlidesHomeEditor";
import { ParceirosEditor } from "../landing/ParceirosEditor";
import { SobreMimEditor } from "../landing/SobreMimEditor";
import { BTN_PRIMARY, BTN_SECONDARY, FORM_LABEL_CLASS, MODAL_INPUT_CLASS } from "../../styles/uiClasses";

const WIDE_MODAL = "!w-[min(920px,calc(100vw-1.4rem))] !max-h-[min(88vh,900px)] !overflow-y-auto p-5";


/** Botão “Editar” — só para admin. Abaixo do header fixo (top-24) para não ficar inacessível. */
export function LandingEditButton({ onClick, label = "Editar", className = "" }) {
  const { isAdmin } = useAuth();
  if (!isAdmin) return null;
  const position = className.includes("absolute") || className.includes("static") || className.includes("relative")
    ? ""
    : "absolute top-24 right-4 z-30";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${position} inline-flex items-center gap-1.5 rounded-lg border border-[rgba(199,149,255,0.45)] bg-[rgba(14,9,28,0.85)] px-2.5 py-1.5 text-xs font-semibold text-[#c4b5fd] backdrop-blur-md transition hover:bg-[rgba(167,79,255,0.25)] hover:text-white ${className}`}
      aria-label={label}
    >
      <Pencil size={14} aria-hidden />
      {label}
    </button>
  );
}

/**
 * Modal para editar título/texto de uma seção da home.
 */
export function LandingSecaoTextoModal({
  isOpen,
  onClose,
  secaoKey,
  tituloSecao,
  valor,
  conteudoCompleto,
  onSaved,
}) {
  const { token } = useAuth();
  const { addToast } = useToast();
  const [titulo, setTitulo] = useState("");
  const [texto, setTexto] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setTitulo(valor?.titulo || "");
    setTexto(valor?.texto || "");
  }, [isOpen, valor?.titulo, valor?.texto]);

  const salvar = async (e) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    try {
      const payload = {
        youtube: conteudoCompleto?.youtube,
        twitch: conteudoCompleto?.twitch,
        artigos: conteudoCompleto?.artigos,
        parceiros: conteudoCompleto?.parceiros,
        [secaoKey]: { titulo: titulo.trim(), texto: texto.trim() },
        fugueteUsuarioId: conteudoCompleto?.fugueteUsuarioId || "",
      };
      const salvo = await salvarConteudoHome(payload, token);
      onSaved?.(salvo);
      addToast("Seção atualizada.", { type: "success" });
      onClose();
    } catch (err) {
      addToast(err.message || "Não foi possível salvar.", { type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} ariaLabelledBy="landing-secao-edit-title">
      <form onSubmit={salvar} className="space-y-4">
        <h2 id="landing-secao-edit-title" className="m-0 text-lg font-bold text-text-main">
          Editar: {tituloSecao}
        </h2>
        <div>
          <label className={FORM_LABEL_CLASS} htmlFor="landing-secao-titulo">Título</label>
          <input
            id="landing-secao-titulo"
            className={MODAL_INPUT_CLASS}
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            maxLength={160}
          />
        </div>
        <div>
          <label className={FORM_LABEL_CLASS} htmlFor="landing-secao-texto">Texto</label>
          <textarea
            id="landing-secao-texto"
            className={`${MODAL_INPUT_CLASS} min-h-[5rem]`}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            maxLength={500}
          />
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" className={BTN_SECONDARY} onClick={onClose}>Cancelar</button>
          <button type="submit" className={BTN_PRIMARY} disabled={saving}>
            {saving ? "Salvando…" : "Salvar"}
          </button>
        </div>
      </form>
    </BaseModal>
  );
}

/** Modal com editor completo de slides (upload + salvar na API). */
export function LandingSlidesModal({ isOpen, onClose, onSaved }) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      ariaLabelledBy="landing-slides-edit-title"
      contentClassName={WIDE_MODAL}
    >
      <h2 id="landing-slides-edit-title" className="m-0 mb-4 text-lg font-bold text-text-main">
        Editar slides da home
      </h2>
      <SlidesHomeEditor
        onSaved={(data) => {
          onSaved?.(data);
          onClose();
        }}
      />
    </BaseModal>
  );
}

/** Modal com editor completo de parceiros (textos + logos). */
export function LandingParceirosModal({ isOpen, onClose, onSaved, title = "Editar parceiros" }) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      ariaLabelledBy="landing-parceiros-edit-title"
      contentClassName={WIDE_MODAL}
    >
      <h2 id="landing-parceiros-edit-title" className="m-0 mb-4 text-lg font-bold text-text-main">
        {title}
      </h2>
      <ParceirosEditor
        onSaved={(data) => {
          onSaved?.(data);
          onClose();
        }}
      />
    </BaseModal>
  );
}

/** Modal com editor da página Sobre mim. */
export function LandingSobreMimModal({ isOpen, onClose, onSaved }) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      ariaLabelledBy="landing-sobre-mim-edit-title"
      contentClassName={WIDE_MODAL}
    >
      <h2 id="landing-sobre-mim-edit-title" className="m-0 mb-4 text-lg font-bold text-text-main">
        Editar Sobre mim
      </h2>
      <SobreMimEditor
        onSaved={(data) => {
          onSaved?.(data);
          onClose();
        }}
      />
    </BaseModal>
  );
}
