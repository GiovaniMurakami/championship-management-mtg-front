import { useState } from "react";
import { BaseModal } from "./BaseModal";
import { FormFeedback } from "./FormFeedback";
import { FormField } from "./FormField";
import { BTN_DANGER, BTN_GHOST } from "../../styles/uiClasses";

/**
 * DeleteConfirmModal — modal de confirmação de exclusão por digitação de nome.
 *
 * @param {boolean}  isOpen
 * @param {function} onClose
 * @param {string}   itemName — nome do item a ser excluído (exibido e validado)
 * @param {function} onConfirm — chamado quando o usuário confirma; recebe () => void
 * @param {boolean}  loading
 * @param {string}   [error]
 * @param {string}   [title]
 * @param {string}   [description]
 */
export function DeleteConfirmModal({
  isOpen,
  onClose,
  itemName = "",
  onConfirm,
  loading = false,
  error = "",
  title = "Confirmar Exclusão",
  description,
}) {
  const [confirmName, setConfirmName] = useState("");

  const handleClose = () => {
    setConfirmName("");
    onClose();
  };

  const handleConfirm = () => {
    onConfirm(confirmName, handleClose);
  };

  const isMatch = confirmName === itemName;

  return (
    <BaseModal isOpen={isOpen} onClose={handleClose} ariaLabelledBy="delete-confirm-title">
      <h2 id="delete-confirm-title" className="font-display text-[1.8rem] mt-0 mb-4 text-text-main">{title}</h2>

      <p className="mb-4 text-text-soft text-[0.92rem]">
        {description ?? (
          <>
            Você está prestes a excluir{" "}
            <strong className="text-brand">{itemName}</strong>. Esta ação é{" "}
            <strong className="text-brand">irreversível</strong>.
          </>
        )}
      </p>

      <p className="mb-3 text-[0.88rem] text-text-soft opacity-80">
        Para confirmar, digite o nome exato:
      </p>

      <FormField
        id="delete-confirm-name"
        label={`Digite: ${itemName}`}
        value={confirmName}
        onChange={(event) => setConfirmName(event.target.value)}
        placeholder={itemName}
        disabled={loading}
        autoFocus
      />

      {error ? <FormFeedback message={error} variant="error" className="mt-3" /> : null}

      <div className="flex gap-3 mt-5">
        <button
          type="button"
          className={`flex-1 ${BTN_GHOST} border border-line`}
          onClick={handleClose}
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          type="button"
          className={`flex-1 ${BTN_DANGER}`}
          onClick={handleConfirm}
          disabled={loading || !isMatch}
        >
          {loading ? "Excluindo..." : "Excluir"}
        </button>
      </div>
    </BaseModal>
  );
}
