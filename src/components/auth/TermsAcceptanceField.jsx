import { Link } from "react-router-dom";
import { termsAcceptanceCardClass } from "../../styles/uiClasses";
import { Checkbox } from "../ui/Checkbox";

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
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={(nextChecked) => onChange(nextChecked === true)}
          required
          size="sm"
          className="mt-0.5"
        />
        <p className="m-0 text-[0.84rem] leading-relaxed text-[#d8cff0]">
          <label htmlFor={id} className="cursor-pointer">
            Li e aceito os{" "}
          </label>
          <Link
            to="/termos-de-uso"
            onClick={handleLegalLinkClick}
            className="font-semibold text-brand underline underline-offset-2 decoration-[#c795ff]/50 transition-colors hover:text-[#e8dfff]"
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
            className="font-semibold text-brand underline underline-offset-2 decoration-[#c795ff]/50 transition-colors hover:text-[#e8dfff]"
          >
            Política de Privacidade (LGPD)
          </Link>
        </p>
      </div>
    </div>
  );
}
