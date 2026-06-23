import { BaseModal } from "../ui/BaseModal";
import { getRankMeta } from "../../utils/rank";

export function RankPromotionModal({ isOpen, onClose, rank }) {
  const meta = getRankMeta(rank);
  if (!meta) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <div className="text-center py-2">
        <div
          className={`mx-auto mb-4 w-20 h-20 rounded-full flex items-center justify-center text-[2.4rem] ${
            meta.isRocket
              ? "bg-[linear-gradient(135deg,rgba(168,85,247,0.4),rgba(56,189,248,0.3),rgba(244,114,182,0.35))] animate-[rank-rocket_1.8s_ease-in-out_infinite] shadow-[0_0_28px_rgba(168,85,247,0.45)]"
              : "bg-white/[0.06] border-2"
          }`}
          style={meta.isRocket ? undefined : { borderColor: meta.color }}
        >
          <span aria-hidden="true">{meta.icon}</span>
        </div>
        <p className="m-0 mb-1 text-[0.8rem] font-bold uppercase tracking-[0.14em] text-[#c795ff]">
          Promoção de rank!
        </p>
        <h2
          className="m-0 mb-3 font-['Bebas_Neue',sans-serif] text-[2.2rem] tracking-[0.04em]"
          style={{ color: meta.color }}
        >
          {meta.label}
        </h2>
        <p className="m-0 mb-5 text-[#beafd7] text-[0.9rem]">
          Parabéns! Você subiu de rank com essa vitória.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="w-full border border-[rgba(199,149,255,0.6)] rounded-xl px-4 py-[0.65rem] cursor-pointer font-bold bg-gradient-to-br from-[#8e39ed] to-[#5f23b3] text-white"
        >
          Continuar
        </button>
      </div>
    </BaseModal>
  );
}
