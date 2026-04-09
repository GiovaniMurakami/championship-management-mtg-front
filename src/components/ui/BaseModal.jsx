/**
 * BaseModal — shared overlay + dialog wrapper.
 * Used by AuthModal, EditProfileModal and any future full-screen modal.
 */
export function BaseModal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

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
        {children}
      </section>
    </div>
  );
}
