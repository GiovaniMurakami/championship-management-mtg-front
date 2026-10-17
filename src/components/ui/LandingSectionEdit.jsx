import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { BaseModal } from "./BaseModal";
import { Tooltip } from "./Tooltip";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../context/ToastContext";
import { salvarConteudoHome } from "../../services/backendApi";
import { SlidesHomeEditor } from "../landing/SlidesHomeEditor";
import { ParceirosEditor } from "../landing/ParceirosEditor";
import { SobreMimEditor } from "../landing/SobreMimEditor";
import { BTN_PRIMARY, BTN_SECONDARY, FORM_LABEL_CLASS, MODAL_INPUT_CLASS } from "../../styles/uiClasses";

const WIDE_MODAL = "!w-[min(920px,calc(100vw-1.4rem))] !max-h-[min(88vh,900px)] !overflow-y-auto p-5";

const EDIT_BTN_ICON_CLASS =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[rgba(199,149,255,0.45)] bg-[rgba(14,9,28,0.88)] text-[#c4b5fd] shadow-[0_4px_16px_rgba(3,2,8,0.35)] backdrop-blur-md transition hover:bg-[rgba(167,79,255,0.28)] hover:text-white";

/**
 * Botão de edição admin — ícone com tooltip (menos ruído que label longo).
 * `icon`: componente Lucide (default Pencil).
 */
export function LandingEditButton({
  onClick,
  label = "Editar",
  className = "",
  icon: Icon = Pencil,
}) {
  const { isAdmin } = useAuth();
  if (!isAdmin) return null;
  return (
    <Tooltip content={label} placement="bottom" focusable={false}>
      <button
        type="button"
        onClick={onClick}
        className={`${EDIT_BTN_ICON_CLASS} ${className}`}
        aria-label={label}
      >
        <Icon size={15} aria-hidden />
      </button>
    </Tooltip>
  );
}

/**
 * Cabeçalho de seção: título centralizado; ações admin ícone à direita
 * (linha compacta no mobile, canto no desktop — sem padding grande no título).
 */
export function LandingSectionHeading({
  title,
  subtitle,
  onEdit,
  editLabel = "Editar seção",
  editActions,
  as: TitleTag = "h2",
  className = "",
  titleClassName = "text-2xl md:text-3xl font-bold text-center mb-2",
  subtitleClassName = "text-center text-[#9b8dc0] mb-0 max-w-2xl mx-auto",
}) {
  const actions = editActions || (onEdit
    ? <LandingEditButton onClick={onEdit} label={editLabel} />
    : null);

  return (
    <div className={`relative mb-8 ${className}`}>
      {actions ? (
        <div className="mb-2 flex justify-end md:absolute md:right-0 md:top-0 md:mb-0 md:z-20">
          <div className="flex flex-wrap justify-end gap-1.5">{actions}</div>
        </div>
      ) : null}
      <TitleTag className={`${titleClassName} ${actions ? "md:px-12" : ""}`.trim()}>
        {title}
      </TitleTag>
      {subtitle ? <div className={subtitleClassName}>{subtitle}</div> : null}
    </div>
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
