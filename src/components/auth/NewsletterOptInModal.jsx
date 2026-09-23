import * as Dialog from "@radix-ui/react-dialog";
import { BTN_PRIMARY, BTN_SECONDARY } from "../../styles/uiClasses";

export function NewsletterOptInModal({
  isOpen,
  onAccept,
  onDecline,
  isLoading = false,
}) {
  return (
    <Dialog.Root open={isOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-md animate-[fade-in_200ms_ease-out]" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-[81] w-[min(420px,calc(100vw-1.5rem))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-line-soft bg-surface/95 p-5 shadow-overlay backdrop-blur-2xl animate-[scale-focus_220ms_var(--ease-standard)] focus:outline-none"
          aria-labelledby="newsletter-optin-title"
          aria-describedby="newsletter-optin-desc"
          onEscapeKeyDown={(event) => event.preventDefault()}
          onPointerDownOutside={(event) => event.preventDefault()}
        >
          <p className="m-0 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-brand">
            Novidade
          </p>
          <Dialog.Title
            id="newsletter-optin-title"
            className="m-0 mt-1 font-['Bebas_Neue',sans-serif] text-[1.85rem] tracking-[0.04em] text-text-main"
          >
            Newsletter de metagame
          </Dialog.Title>
          <Dialog.Description
            id="newsletter-optin-desc"
            className="m-0 mt-3 text-[0.95rem] leading-6 text-text-soft"
          >
            Quer receber, toda segunda-feira, um e-mail com o resumo do metagame da semana
            (arquétipos mais jogados e winrate)?
          </Dialog.Description>

          <ul className="mt-4 mb-0 list-none space-y-2 p-0 text-sm text-text-muted">
            <li className="rounded-lg border border-line-soft bg-white/[0.03] px-3 py-2">
              Top arquétipos dos últimos 7 dias
            </li>
            <li className="rounded-lg border border-line-soft bg-white/[0.03] px-3 py-2">
              Você pode cancelar a qualquer momento no perfil
            </li>
          </ul>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              className={`flex-1 ${BTN_PRIMARY}`}
              disabled={isLoading}
              onClick={onAccept}
            >
              {isLoading ? "Salvando..." : "Quero receber"}
            </button>
            <button
              type="button"
              className={`flex-1 ${BTN_SECONDARY}`}
              disabled={isLoading}
              onClick={onDecline}
            >
              Agora não
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
