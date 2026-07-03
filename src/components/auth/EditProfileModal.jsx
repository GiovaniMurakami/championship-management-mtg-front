import { BaseModal } from "../ui/BaseModal";
import { FormFeedback, FormField } from "../ui";
import { BTN_GHOST, BTN_PRIMARY } from "../../styles/uiClasses";

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
      <div className="mb-5 text-center">
        <p className="mb-1 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-[#c795ff]">
          Sua conta
        </p>
        <h2 className="font-['Bebas_Neue',sans-serif] text-[1.85rem] tracking-[0.04em] text-[#f5edff] m-0">
          Editar perfil
        </h2>
        <p className="mt-1 text-[0.88rem] text-[#9f91bd]">
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
          <button className={`flex-1 ${BTN_PRIMARY}`} disabled={isLoading} type="submit">
            {isLoading ? "Salvando..." : "Salvar"}
          </button>
          <button className={`flex-1 ${BTN_GHOST} border border-[rgba(217,180,255,0.2)]`} type="button" onClick={onClose} disabled={isLoading}>
            Cancelar
          </button>
        </div>
      </form>
    </BaseModal>
  );
}
