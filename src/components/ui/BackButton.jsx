import { BTN_BACK } from "../../styles/uiClasses";

export function BackButton({ onClick, children = "← Voltar", className = "" }) {
  return (
    <button type="button" className={`${BTN_BACK} ${className}`} onClick={onClick}>
      {children}
    </button>
  );
}
