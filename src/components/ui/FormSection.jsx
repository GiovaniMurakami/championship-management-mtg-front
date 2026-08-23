import { FORM_SECTION_CLASS, FORM_SECTION_TITLE_CLASS } from "../../styles/uiClasses";

export function FormSection({ title, subtitle, children, className = "" }) {
  return (
    <div className={`${FORM_SECTION_CLASS} ${className}`}>
      {title ? (
        <h3 className={FORM_SECTION_TITLE_CLASS}>
          {title}
          {subtitle ? (
            <span className="text-text-muted text-[0.75rem] normal-case tracking-normal font-normal">
              {" "}
              {subtitle}
            </span>
          ) : null}
        </h3>
      ) : null}
      {children}
    </div>
  );
}
