/**
 * Shared Tailwind class strings.
 * Import from here instead of declaring locally in each component.
 */

/** Input used inside auth/profile modals (AuthModal, EditProfileModal). */
export const MODAL_INPUT_CLASS =
  "border border-[rgba(217,180,255,0.2)] rounded-[0.7rem] bg-white/[0.03] text-[#f5edff] px-[0.7rem] py-[0.65rem] w-full transition-[border-color,background-color,box-shadow] duration-200 hover:border-[rgba(199,149,255,0.5)] hover:bg-white/[0.045] focus:outline-none focus:border-[rgba(199,149,255,0.92)] focus:shadow-[0_0_0_3px_rgba(167,79,255,0.22)] focus:bg-white/[0.05]";

/** Input used inside tournament create/edit forms. */
export const TOURNAMENT_INPUT_CLASS =
  "px-4 py-3 border-2 border-[#333] rounded-lg bg-white/[0.05] text-white text-base transition-all duration-300 focus:outline-none focus:border-[#4f46e5] focus:shadow-[0_0_0_3px_rgba(79,70,229,0.1)] focus:bg-white/[0.1] placeholder:text-[#888] [color-scheme:dark] [&_option]:bg-[#1a1129] [&_option]:text-white";

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
