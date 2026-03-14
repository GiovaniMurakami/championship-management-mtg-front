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
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <section
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="auth-modal-title">Editar Perfil</h2>

        <form className="auth-form" onSubmit={onSubmit}>
          <label>
            Nome
            <input
              type="text"
              value={form.nome}
              onChange={(event) =>
                onFormChange((current) => ({ ...current, nome: event.target.value }))
              }
            />
          </label>
          <label>
            Telefone
            <input
              type="tel"
              placeholder="(opcional)"
              value={form.telefone}
              onChange={(event) =>
                onFormChange((current) => ({ ...current, telefone: event.target.value }))
              }
            />
          </label>
          <label>
            Nick MTGO
            <input
              type="text"
              placeholder="(opcional)"
              value={form.nickMTGO}
              onChange={(event) =>
                onFormChange((current) => ({ ...current, nickMTGO: event.target.value }))
              }
            />
          </label>
          <label>
            Nick Arena
            <input
              type="text"
              placeholder="(opcional)"
              value={form.nickArena}
              onChange={(event) =>
                onFormChange((current) => ({ ...current, nickArena: event.target.value }))
              }
            />
          </label>
          <div className="auth-modal-actions">
            <button className="btn primary" disabled={isLoading} type="submit">
              {isLoading ? "Salvando..." : "Salvar"}
            </button>
            <button className="btn secondary" type="button" onClick={onClose} disabled={isLoading}>
              Cancelar
            </button>
          </div>
        </form>
        {message ? <p className="feedback">{message}</p> : null}
      </section>
    </div>
  );
}
