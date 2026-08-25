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
      className="fixed inset-0 z-[60] grid place-items-center bg-black/55 backdrop-blur-md animate-[fade-in_200ms_ease-out]"
      role="presentation"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <section
        ref={dialogRef}
        className="w-[min(460px,calc(100vw-1.4rem))] border border-line-soft rounded-2xl bg-surface/95 backdrop-blur-2xl p-4 shadow-overlay animate-[scale-focus_220ms_var(--ease-standard)] relative overflow-hidden"
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
