/**
 * Shared Tailwind class strings.
 * Import from here instead of declaring locally in each component.
 */

/** Input used inside auth/profile modals (AuthModal, EditProfileModal). */
export const MODAL_INPUT_CLASS =
  "w-full rounded-lg border border-line bg-surface-soft px-3 py-2.5 text-text-main transition-[border-color,background-color,box-shadow] duration-200 hover:border-line-strong hover:bg-white/[0.05] focus:border-brand focus:bg-white/[0.05] focus:outline-none focus:shadow-focus";

/** Input used in page forms (torneio, liga, time, deck list filters). */
export const TOURNAMENT_INPUT_CLASS =
  "w-full rounded-lg border border-line bg-surface-soft px-4 py-3 text-base text-text-main transition-[border-color,background-color,box-shadow] duration-200 hover:border-line-strong hover:bg-white/[0.05] focus:border-brand focus:bg-white/[0.05] focus:outline-none focus:shadow-focus placeholder:text-text-muted [color-scheme:dark] [&_option]:bg-surface [&_option]:text-text-main disabled:cursor-not-allowed disabled:opacity-60";

/** Textarea variant of page form input. */
export const FORM_TEXTAREA_CLASS = `${TOURNAMENT_INPUT_CLASS} resize-y min-h-[80px]`;

/** Character counter below textareas. */
export const FORM_COUNTER_CLASS = "text-right text-[0.78rem] text-text-muted";

// ---------------------------------------------------------------------------
// Button variants
// ---------------------------------------------------------------------------

/** Primary action button (indigo gradient). */
export const BTN_PRIMARY =
  "cursor-pointer rounded-lg border border-line-strong bg-gradient-to-br from-brand-strong to-brand-deep px-4 py-2.5 font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-px hover:shadow-[0_6px_22px_rgba(142,57,237,0.38)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50";

/** Secondary / outline button. */
export const BTN_SECONDARY =
  "cursor-pointer rounded-lg border border-line bg-surface-soft px-4 py-2.5 font-bold text-text-soft transition-all duration-200 hover:border-line-strong hover:bg-surface-hover hover:text-text-main disabled:cursor-not-allowed disabled:opacity-50";

/** Destructive / danger button (red). */
export const BTN_DANGER =
  "cursor-pointer rounded-lg border border-danger/60 bg-gradient-to-br from-danger to-[#d1486a] px-4 py-2.5 font-bold text-white shadow-[0_4px_12px_rgba(252,88,119,0.22)] transition-all duration-200 enabled:hover:-translate-y-px enabled:hover:shadow-[0_8px_24px_rgba(252,88,119,0.35)] disabled:cursor-not-allowed disabled:opacity-50";

/** Ghost / text button (no background). */
export const BTN_GHOST =
  "cursor-pointer rounded-lg border-none bg-transparent px-4 py-2.5 font-semibold text-text-soft transition-colors duration-200 hover:bg-surface-soft hover:text-text-main disabled:cursor-not-allowed disabled:opacity-50";

/** Label above modal/auth form fields. */
export const FORM_LABEL_CLASS =
  "grid gap-1.5 text-[0.82rem] font-semibold uppercase tracking-[0.06em] text-text-subtle";

/** Hint below form fields. */
export const FORM_HINT_CLASS = "text-[0.78rem] leading-snug text-text-muted";

/** Auth tab strip container. */
export const AUTH_TABS_CLASS =
  "grid grid-cols-2 gap-1 rounded-lg border border-line bg-surface-soft p-1";

/** Single auth tab button. */
export function authTabClass(isActive) {
  return [
    "cursor-pointer rounded-md border-none px-3 py-2.5 text-[0.9rem] font-semibold transition-all duration-200",
    isActive
      ? "bg-[rgba(167,79,255,0.22)] text-white shadow-[0_0_0_1px_rgba(199,149,255,0.25)]"
      : "bg-transparent text-text-soft hover:bg-[rgba(167,79,255,0.08)] hover:text-[#e8dfff]",
  ].join(" ");
}

/** Centered narrow card for auth / password flows. */
export const FORM_CARD_CLASS =
  "relative w-[min(440px,100%)] overflow-hidden rounded-xl border border-line bg-surface p-6 shadow-card before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-[linear-gradient(90deg,transparent,#2ccfb4,#a855f7,#c795ff,transparent)] before:content-['']";

/** Centered wide card (ingresso, fluxos multi-step). */
export const FORM_WIDE_CARD_CLASS =
  "relative w-full max-w-[480px] overflow-hidden rounded-xl border border-line bg-[linear-gradient(155deg,rgba(34,19,69,0.7),rgba(15,10,29,0.9))] p-8 shadow-overlay before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-[linear-gradient(90deg,transparent,#2ccfb4,#a855f7,#c795ff,transparent)] before:content-['']";

/** Wide form shell inside PageShell. */
export const FORM_PAGE_SHELL_CLASS =
  "mb-8 rounded-xl border border-line bg-[linear-gradient(155deg,rgba(34,19,69,0.85),rgba(15,10,29,0.95))] p-8 shadow-card max-[768px]:p-6";

/** Page form main title (Bebas). */
export const FORM_PAGE_TITLE_CLASS =
  "m-0 mb-2 text-center font-display text-[1.85rem] tracking-[0.04em] text-text-main";

/** Page form subtitle. */
export const FORM_PAGE_SUBTITLE_CLASS = "m-0 mb-8 text-center text-[0.9rem] text-text-subtle";

/** Card form section (grouped fields). */
export const FORM_SECTION_CLASS =
  "flex flex-col gap-4 rounded-lg border border-line bg-brand-soft/30 p-5 max-[480px]:p-4";

/** Section heading inside FORM_SECTION_CLASS. */
export const FORM_SECTION_TITLE_CLASS =
  "m-0 mb-1 border-b border-line pb-2 text-[0.78rem] font-bold uppercase tracking-[0.08em] text-brand";

/** Back navigation button on form pages. */
export const BTN_BACK =
  "inline-flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-surface-soft px-4 py-2 text-[0.9rem] font-medium text-text-soft transition-all duration-200 hover:border-line-strong hover:bg-surface-hover hover:text-white";

/** Full-width primary submit on form pages. */
export const BTN_SUBMIT =
  `${BTN_PRIMARY} w-full mt-2 text-[1rem] py-3.5`;

/** Card container for legal acceptance checkbox. */
export function termsAcceptanceCardClass(checked) {
  return [
    "rounded-xl border px-3.5 py-3 transition-colors duration-200",
    checked
      ? "border-[rgba(199,149,255,0.45)] bg-[rgba(167,79,255,0.1)]"
      : "border-line-soft bg-[rgba(255,255,255,0.02)]",
  ].join(" ");
}
