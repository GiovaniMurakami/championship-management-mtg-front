import { ImageUploader } from "../ui";

const inputClass =
  "border border-[rgba(217,180,255,0.2)] rounded-[0.7rem] bg-white/[0.03] text-[#f5edff] px-[0.7rem] py-[0.65rem] w-full transition-[border-color,background-color,box-shadow] duration-200 hover:border-[rgba(199,149,255,0.5)] hover:bg-white/[0.045] focus:outline-none focus:border-[rgba(199,149,255,0.92)] focus:shadow-[0_0_0_3px_rgba(167,79,255,0.22)] focus:bg-white/[0.05]";

export function EditProfileModal({
  isOpen,
  onClose,
  isLoading,
  message,
  form,
  onFormChange,
  onSubmit,
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center bg-[rgba(5,3,9,0.72)] backdrop-blur-sm animate-[fade-in_250ms_ease-out]"
      role="presentation"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <section
        className="w-[min(460px,calc(100vw-1.4rem))] border border-[rgba(217,180,255,0.2)] rounded-2xl bg-[#160e2d] p-4 animate-[scale-focus_350ms_cubic-bezier(0.34,1.56,0.64,1)] relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-[linear-gradient(90deg,transparent,#2ccfb4,#a855f7,#c795ff,transparent)]"
        role="dialog"
        aria-modal="true"
      >
        <h2 className="mb-6 text-center m-0">Editar Perfil</h2>

        <form className="grid gap-[0.85rem]" onSubmit={onSubmit}>
          <ImageUploader
            value={form.fotoUrl}
            onChange={(url) => onFormChange((current) => ({ ...current, fotoUrl: url }))}
            uploadType="avatar"
            label="Foto de Perfil"
          />
          <label className="grid gap-[0.45rem] text-[#beafd7] text-[0.95rem]">
            Nome
            <input
              type="text"
              value={form.nome}
              onChange={(event) =>
                onFormChange((current) => ({ ...current, nome: event.target.value }))
              }
              className={inputClass}
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
              className={inputClass}
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
              className={inputClass}
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
              className={inputClass}
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
      </section>
    </div>
  );
}
