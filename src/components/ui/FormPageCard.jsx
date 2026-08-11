import { FORM_CARD_CLASS } from "../../styles/uiClasses";

export function FormPageCard({ children, className = "" }) {
  return (
    <div className={`min-h-screen grid place-items-center px-4 py-12 ${className}`}>
      <section className={FORM_CARD_CLASS}>{children}</section>
    </div>
  );
}
