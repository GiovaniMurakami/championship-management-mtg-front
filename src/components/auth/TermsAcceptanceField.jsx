import { Link } from "react-router-dom";

export function TermsAcceptanceField({ checked, onChange, id = "aceite-termos" }) {
  return (
    <label
      htmlFor={id}
      className="flex items-start gap-2.5 text-[0.85rem] leading-snug text-[#beafd7] cursor-pointer"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        required
        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[#8e39ed] border-0 bg-transparent p-0 shadow-none"
      />
      <span>
        Li e aceito os{" "}
        <Link
          to="/termos-de-uso"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#c795ff] underline underline-offset-2 decoration-[#c795ff]/70 transition-colors hover:text-[#e8dfff] hover:decoration-[#e8dfff]"
          onClick={(event) => event.stopPropagation()}
        >
          Termos de Uso
        </Link>
        .
      </span>
    </label>
  );
}
