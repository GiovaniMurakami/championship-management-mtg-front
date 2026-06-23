import { useState } from "react";
import { BaseModal } from "./BaseModal";
import { MODAL_INPUT_CLASS } from "../../styles/uiClasses";

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

      <input
        type="text"
        value={confirmName}
        onChange={(e) => setConfirmName(e.target.value)}
        placeholder={`Digite: ${itemName}`}
        className={MODAL_INPUT_CLASS}
        disabled={loading}
        autoFocus
      />

      {error && (
        <p className="mt-3 px-3 py-2 rounded-[0.6rem] bg-[rgba(252,88,119,0.15)] text-[#ffc8d4] text-[0.88rem]">
          {error}
        </p>
      )}

      <div className="flex gap-3 mt-5">
        <button
          type="button"
          className="flex-1 border border-line rounded-xl px-4 py-[0.6rem] cursor-pointer font-bold bg-transparent text-text-soft transition-all duration-[220ms] hover:text-text-main hover:border-[rgba(199,149,255,0.5)] hover:bg-white/[0.05]"
          onClick={handleClose}
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          type="button"
          className="flex-1 border border-[rgba(252,88,119,0.6)] rounded-xl px-4 py-[0.6rem] cursor-pointer font-bold bg-gradient-to-br from-[#fc5877] to-[#d1486a] text-white shadow-[0_4px_12px_rgba(252,88,119,0.25)] transition-all duration-[220ms] enabled:hover:-translate-y-0.5 enabled:hover:shadow-[0_8px_24px_rgba(252,88,119,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleConfirm}
          disabled={loading || !isMatch}
        >
          {loading ? "Excluindo..." : "Excluir"}
        </button>
      </div>
    </BaseModal>
  );
}
