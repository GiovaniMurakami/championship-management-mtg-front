/**
 * Shared Tailwind class strings.
 * Import from here instead of declaring locally in each component.
 */

/** Input used inside auth/profile modals (AuthModal, EditProfileModal). */
export const MODAL_INPUT_CLASS =
  "border border-[rgba(217,180,255,0.2)] rounded-[0.7rem] bg-white/[0.03] text-[#f5edff] px-[0.7rem] py-[0.65rem] w-full transition-[border-color,background-color,box-shadow] duration-200 hover:border-[rgba(199,149,255,0.5)] hover:bg-white/[0.045] focus:outline-none focus:border-[rgba(199,149,255,0.92)] focus:shadow-[0_0_0_3px_rgba(167,79,255,0.22)] focus:bg-white/[0.05]";

/** Input used in page forms (torneio, liga, time, deck list filters). */
export const TOURNAMENT_INPUT_CLASS =
  "border border-[rgba(217,180,255,0.2)] rounded-[0.7rem] bg-white/[0.03] text-[#f5edff] px-4 py-3 w-full text-base transition-[border-color,background-color,box-shadow] duration-200 hover:border-[rgba(199,149,255,0.5)] hover:bg-white/[0.045] focus:outline-none focus:border-[rgba(199,149,255,0.92)] focus:shadow-[0_0_0_3px_rgba(167,79,255,0.22)] focus:bg-white/[0.05] placeholder:text-[#8f82ad] [color-scheme:dark] [&_option]:bg-[#1a1129] [&_option]:text-[#f5edff] disabled:opacity-60 disabled:cursor-not-allowed";

/** Textarea variant of page form input. */
export const FORM_TEXTAREA_CLASS = `${TOURNAMENT_INPUT_CLASS} resize-y min-h-[80px]`;

/** Character counter below textareas. */
export const FORM_COUNTER_CLASS = "text-[0.78rem] text-[#8f82ad] text-right";

// ---------------------------------------------------------------------------
// Button variants
// ---------------------------------------------------------------------------

/** Primary action button (indigo gradient). */
export const BTN_PRIMARY =
  "px-4 py-[0.6rem] border border-[rgba(199,149,255,0.5)] rounded-xl cursor-pointer font-bold bg-gradient-to-br from-[#8e39ed] to-[#5f23b3] text-white transition-all duration-200 hover:shadow-[0_4px_20px_rgba(142,57,237,0.45)] hover:-translate-y-px active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed";

/** Secondary / outline button. */
export const BTN_SECONDARY =
  "px-4 py-[0.6rem] border border-line rounded-xl cursor-pointer font-bold bg-transparent text-text-soft transition-all duration-[220ms] hover:text-text-main hover:border-[rgba(199,149,255,0.5)] hover:bg-white/[0.05] disabled:opacity-50 disabled:cursor-not-allowed";

/** Destructive / danger button (red). */
export const BTN_DANGER =
  "px-4 py-[0.6rem] border border-[rgba(252,88,119,0.6)] rounded-xl cursor-pointer font-bold bg-gradient-to-br from-[#fc5877] to-[#d1486a] text-white shadow-[0_4px_12px_rgba(252,88,119,0.25)] transition-all duration-[220ms] enabled:hover:-translate-y-0.5 enabled:hover:shadow-[0_8px_24px_rgba(252,88,119,0.4)] disabled:opacity-50 disabled:cursor-not-allowed";

/** Ghost / text button (no background). */
export const BTN_GHOST =
  "px-4 py-[0.6rem] border-none rounded-xl cursor-pointer font-semibold bg-transparent text-text-soft transition-colors duration-[180ms] hover:text-text-main disabled:opacity-50 disabled:cursor-not-allowed";

/** Label above modal/auth form fields. */
export const FORM_LABEL_CLASS =
  "grid gap-1.5 text-[0.82rem] font-semibold uppercase tracking-[0.06em] text-[#9f91bd]";

/** Hint below form fields. */
export const FORM_HINT_CLASS = "text-[0.78rem] leading-snug text-[#8f82ad]";

/** Auth tab strip container. */
export const AUTH_TABS_CLASS =
  "grid grid-cols-2 rounded-xl border border-[rgba(217,180,255,0.18)] bg-[rgba(255,255,255,0.02)] p-1 gap-1";

/** Single auth tab button. */
export function authTabClass(isActive) {
  return [
    "rounded-[0.6rem] border-none py-2.5 px-3 cursor-pointer text-[0.9rem] font-semibold transition-all duration-200",
    isActive
      ? "bg-[rgba(167,79,255,0.22)] text-white shadow-[0_0_0_1px_rgba(199,149,255,0.25)]"
      : "bg-transparent text-[#beafd7] hover:bg-[rgba(167,79,255,0.08)] hover:text-[#e8dfff]",
  ].join(" ");
}

/** Centered narrow card for auth / password flows. */
export const FORM_CARD_CLASS =
  "w-[min(440px,100%)] border border-[rgba(217,180,255,0.2)] rounded-2xl bg-[#160e2d] p-6 relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-[linear-gradient(90deg,transparent,#2ccfb4,#a855f7,#c795ff,transparent)]";

/** Centered wide card (ingresso, fluxos multi-step). */
export const FORM_WIDE_CARD_CLASS =
  "w-full max-w-[480px] border border-[rgba(217,180,255,0.2)] rounded-2xl bg-[linear-gradient(155deg,rgba(34,19,69,0.7),rgba(15,10,29,0.9))] p-8 shadow-[0_24px_64px_rgba(0,0,0,0.5)] relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-[linear-gradient(90deg,transparent,#2ccfb4,#a855f7,#c795ff,transparent)]";

/** Wide form shell inside PageShell. */
export const FORM_PAGE_SHELL_CLASS =
  "bg-[linear-gradient(155deg,rgba(34,19,69,0.85),rgba(15,10,29,0.95))] p-8 mb-8 rounded-2xl border border-[rgba(217,180,255,0.2)] shadow-[0_8px_32px_rgba(0,0,0,0.35)] max-[768px]:p-6";

/** Page form main title (Bebas). */
export const FORM_PAGE_TITLE_CLASS =
  "font-['Bebas_Neue',sans-serif] text-[1.85rem] tracking-[0.04em] text-[#f5edff] text-center mb-2 m-0";

/** Page form subtitle. */
export const FORM_PAGE_SUBTITLE_CLASS = "text-[#9f91bd] text-[0.9rem] text-center mb-8 m-0";

/** Card form section (grouped fields). */
export const FORM_SECTION_CLASS =
  "flex flex-col gap-4 p-5 border border-[rgba(217,180,255,0.18)] rounded-xl bg-[rgba(167,79,255,0.04)] max-[480px]:p-4";

/** Section heading inside FORM_SECTION_CLASS. */
export const FORM_SECTION_TITLE_CLASS =
  "text-[0.78rem] font-bold tracking-[0.08em] uppercase text-[#c795ff] m-0 mb-1 pb-2 border-b border-[rgba(217,180,255,0.18)]";

/** Back navigation button on form pages. */
export const BTN_BACK =
  "inline-flex items-center gap-[0.4rem] px-4 py-2 border border-[rgba(217,180,255,0.2)] rounded-xl bg-white/[0.03] text-[#beafd7] text-[0.9rem] font-medium cursor-pointer transition-all duration-200 hover:text-white hover:border-[rgba(199,149,255,0.5)] hover:bg-white/[0.06] hover:-translate-x-[2px]";

/** Full-width primary submit on form pages. */
export const BTN_SUBMIT =
  `${BTN_PRIMARY} w-full mt-2 text-[1rem] py-3.5`;

/** Card container for legal acceptance checkbox. */
export function termsAcceptanceCardClass(checked) {
  return [
    "rounded-xl border px-3.5 py-3 transition-colors duration-200",
    checked
      ? "border-[rgba(199,149,255,0.45)] bg-[rgba(167,79,255,0.1)]"
      : "border-[rgba(217,180,255,0.16)] bg-[rgba(255,255,255,0.02)]",
  ].join(" ");
}
