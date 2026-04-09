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
