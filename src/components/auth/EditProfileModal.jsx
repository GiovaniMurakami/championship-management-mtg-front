import { useState } from "react";
import { BaseModal } from "../ui/BaseModal";
import { DeleteConfirmModal } from "../ui/DeleteConfirmModal";
import { FormFeedback, FormField } from "../ui";
import { BTN_DANGER, BTN_GHOST, BTN_PRIMARY } from "../../styles/uiClasses";

export function EditProfileModal({
  isOpen,
  onClose,
  isLoading,
  message,
  form,
  onFormChange,
  onSubmit,
  usuarioNome = "",
  onDeleteAccount,
  deleteLoading = false,
  deleteError = "",
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleClose = () => {
    setShowDeleteConfirm(false);
    onClose();
  };

  return (
    <>
      <BaseModal isOpen={isOpen && !showDeleteConfirm} onClose={handleClose}>
        <div className="mb-5 text-center">
          <p className="mb-1 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-brand">
            Sua conta
          </p>
          <h2 className="font-['Bebas_Neue',sans-serif] text-[1.85rem] tracking-[0.04em] text-text-main m-0">
            Editar perfil
          </h2>
          <p className="mt-1 text-[0.88rem] text-text-subtle">
            Atualize como você aparece nos torneios e pareamentos.
          </p>
        </div>

        <form className="grid gap-4" onSubmit={onSubmit}>
          <FormField
            id="profile-nome"
            label="Nome"
            autoComplete="name"
            value={form.nome}
            onChange={(event) => onFormChange((current) => ({ ...current, nome: event.target.value }))}
            required
          />
          <FormField
            id="profile-telefone"
            label="Telefone"
            type="tel"
            placeholder="(opcional)"
            hint="Usado apenas para contato em eventos, se necessário."
            value={form.telefone}
            onChange={(event) => onFormChange((current) => ({ ...current, telefone: event.target.value }))}
          />
          <FormField
            id="profile-nick-mtgo"
            label="Nick MTGO"
            placeholder="(opcional)"
            value={form.nickMTGO}
            onChange={(event) => onFormChange((current) => ({ ...current, nickMTGO: event.target.value }))}
          />
          <FormField
            id="profile-nick-arena"
            label="Nick Arena"
            placeholder="(opcional)"
            value={form.nickArena}
            onChange={(event) => onFormChange((current) => ({ ...current, nickArena: event.target.value }))}
          />

          {message ? <FormFeedback message={message} /> : null}

          <div className="flex gap-3 pt-1">
            <button className={`flex-1 ${BTN_PRIMARY}`} disabled={isLoading || deleteLoading} type="submit">
              {isLoading ? "Salvando..." : "Salvar"}
            </button>
            <button
              className={`flex-1 ${BTN_GHOST} border border-line`}
              type="button"
              onClick={handleClose}
              disabled={isLoading || deleteLoading}
            >
              Cancelar
            </button>
          </div>
        </form>

        <div className="mt-6 border-t border-[rgba(252,88,119,0.22)] pt-5">
          <p className="m-0 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-[#ffa8b8]">
            Zona de risco
          </p>
          <p className="mt-2 mb-3 text-[0.84rem] leading-relaxed text-text-soft">
            A exclusão anonimiza sua conta e remove dados pessoais. Decks e
            participações em torneios são preservados e passam a aparecer como
            &quot;Usuário excluído&quot;. Esta ação é irreversível.
          </p>
          <button
            type="button"
            className={`w-full ${BTN_DANGER}`}
            disabled={isLoading || deleteLoading || !usuarioNome}
            onClick={() => setShowDeleteConfirm(true)}
          >
            Excluir minha conta
          </button>
        </div>
      </BaseModal>

      <DeleteConfirmModal
        isOpen={isOpen && showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        itemName={usuarioNome}
        loading={deleteLoading}
        error={deleteError}
        title="Excluir conta"
        description={
          <>
            Você está prestes a excluir a conta{" "}
            <strong className="text-brand">{usuarioNome}</strong>. Dados pessoais
            serão anonimizados; decks e histórico de torneios permanecem visíveis
            como usuário excluído.
          </>
        }
        onConfirm={(confirmName, closeModal) => {
          onDeleteAccount?.(confirmName, () => {
            setShowDeleteConfirm(false);
            closeModal?.();
          });
        }}
      />
    </>
  );
}
