import { useEffect, useRef } from "react";

/**
 * BaseModal — shared overlay + dialog wrapper.
 * Used by AuthModal, EditProfileModal and any future full-screen modal.
 */
export function BaseModal({
  isOpen,
  onClose,
  children,
  ariaLabelledBy,
  ariaDescribedBy,
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const frameId = requestAnimationFrame(() => {
      const focusable = dialogRef.current?.querySelector(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      focusable?.focus();
    });

    return () => cancelAnimationFrame(frameId);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center bg-[rgba(5,3,9,0.72)] backdrop-blur-sm animate-[fade-in_250ms_ease-out]"
      role="presentation"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <section
        ref={dialogRef}
        className="w-[min(460px,calc(100vw-1.4rem))] border border-line rounded-2xl bg-surface p-4 animate-[scale-focus_350ms_cubic-bezier(0.34,1.56,0.64,1)] relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-[linear-gradient(90deg,transparent,#2ccfb4,#a855f7,#c795ff,transparent)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
      >
        {children}
      </section>
    </div>
  );
}
