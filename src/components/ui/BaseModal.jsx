import * as Dialog from "@radix-ui/react-dialog";

/**
 * Shared accessible modal built on Radix Dialog.
 */
export function BaseModal({
  isOpen,
  onClose,
  children,
  ariaLabelledBy,
  ariaDescribedBy,
}) {
  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/55 backdrop-blur-md animate-[fade-in_200ms_ease-out]" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-[61] w-[min(460px,calc(100vw-1.4rem))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-line-soft bg-surface/95 p-4 shadow-overlay backdrop-blur-2xl animate-[scale-focus_220ms_var(--ease-standard)] focus:outline-none"
          aria-labelledby={ariaLabelledBy}
          aria-describedby={ariaDescribedBy}
        >
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
