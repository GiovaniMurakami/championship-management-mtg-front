import { Link } from "react-router-dom";
import { termsAcceptanceCardClass } from "../../styles/uiClasses";

export function TermsAcceptanceField({
  checked,
  onChange,
  onLegalLinkClick,
  id = "aceite-termos",
}) {
  const handleLegalLinkClick = () => {
    onLegalLinkClick?.();
  };

  return (
    <div className={termsAcceptanceCardClass(checked)}>
      <div className="flex items-start gap-3">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          required
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[#8e39ed] border-0 bg-transparent p-0 shadow-none"
        />
        <p className="m-0 text-[0.84rem] leading-relaxed text-[#d8cff0]">
          <label htmlFor={id} className="cursor-pointer">
            Li e aceito os{" "}
          </label>
          <Link
            to="/termos-de-uso"
            onClick={handleLegalLinkClick}
            className="font-semibold text-[#c795ff] underline underline-offset-2 decoration-[#c795ff]/50 transition-colors hover:text-[#e8dfff]"
          >
            Termos de Uso
          </Link>
          <label htmlFor={id} className="cursor-pointer">
            {" "}
            e a{" "}
          </label>
          <Link
            to="/privacidade"
            onClick={handleLegalLinkClick}
            className="font-semibold text-[#c795ff] underline underline-offset-2 decoration-[#c795ff]/50 transition-colors hover:text-[#e8dfff]"
          >
            Política de Privacidade (LGPD)
          </Link>
        </p>
      </div>
    </div>
  );
}
