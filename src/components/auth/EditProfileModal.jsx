import { BaseModal } from "../ui/BaseModal";
import { MODAL_INPUT_CLASS } from "../../styles/uiClasses";

export function EditProfileModal({
  isOpen,
  onClose,
  isLoading,
  message,
  form,
  onFormChange,
  onSubmit,
}) {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
        <h2 className="mb-6 text-center m-0">Editar Perfil</h2>

        <form className="grid gap-[0.85rem]" onSubmit={onSubmit}>
          <label className="grid gap-[0.45rem] text-[#beafd7] text-[0.95rem]">
            Nome
            <input
              type="text"
              value={form.nome}
              onChange={(event) =>
                onFormChange((current) => ({ ...current, nome: event.target.value }))
              }
              className={MODAL_INPUT_CLASS}
            />
          </label>
          <label className="grid gap-[0.45rem] text-[#beafd7] text-[0.95rem]">
            Telefone
            <input
              type="tel"
              placeholder="(opcional)"
              value={form.telefone}
              onChange={(event) =>
                onFormChange((current) => ({ ...current, telefone: event.target.value }))
              }
              className={MODAL_INPUT_CLASS}
            />
          </label>
          <label className="grid gap-[0.45rem] text-[#beafd7] text-[0.95rem]">
            Nick MTGO
            <input
              type="text"
              placeholder="(opcional)"
              value={form.nickMTGO}
              onChange={(event) =>
                onFormChange((current) => ({ ...current, nickMTGO: event.target.value }))
              }
              className={MODAL_INPUT_CLASS}
            />
          </label>
          <label className="grid gap-[0.45rem] text-[#beafd7] text-[0.95rem]">
            Nick Arena
            <input
              type="text"
              placeholder="(opcional)"
              value={form.nickArena}
              onChange={(event) =>
                onFormChange((current) => ({ ...current, nickArena: event.target.value }))
              }
              className={MODAL_INPUT_CLASS}
            />
          </label>
          <div className="flex gap-4">
            <button
              className="flex-1 border border-[rgba(199,149,255,0.6)] rounded-xl px-4 py-[0.6rem] cursor-pointer font-bold bg-gradient-to-br from-[#8e39ed] to-[#5f23b3] text-white shadow-[0_4px_12px_rgba(167,79,255,0.25)] transition-all duration-[220ms] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(167,79,255,0.4)] disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? "Salvando..." : "Salvar"}
            </button>
            <button
              className="flex-1 border border-[rgba(217,180,255,0.2)] rounded-xl px-4 py-[0.6rem] cursor-pointer font-bold bg-white/[0.03] text-[#f5edff] transition-all duration-[220ms] hover:border-[rgba(199,149,255,0.5)] hover:bg-white/[0.08] hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed"
              type="button"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </button>
          </div>
        </form>

        {message && (
          <p className="mt-[0.7rem] mb-0 px-3 py-3 rounded-[0.6rem] bg-[rgba(44,207,180,0.1)] border border-[rgba(44,207,180,0.25)] text-[#5eead4] text-[0.9rem]">
            {message}
          </p>
        )}
    </BaseModal>
  );
}
