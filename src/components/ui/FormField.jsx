import {
  FORM_HINT_CLASS,
  FORM_LABEL_CLASS,
  FORM_TEXTAREA_CLASS,
  MODAL_INPUT_CLASS,
  TOURNAMENT_INPUT_CLASS,
} from "../../styles/uiClasses";

const INPUT_BY_SIZE = {
  modal: MODAL_INPUT_CLASS,
  page: TOURNAMENT_INPUT_CLASS,
};

export function FormField({
  label,
  hint,
  id,
  name,
  type = "text",
  multiline = false,
  rows = 3,
  maxLength,
  value,
  onChange,
  required = false,
  disabled = false,
  autoComplete,
  minLength,
  placeholder,
  size = "modal",
  className = "",
  inputClassName,
  autoFocus = false,
}) {
  const inputClass = inputClassName || INPUT_BY_SIZE[size] || MODAL_INPUT_CLASS;
  const sharedProps = {
    id,
    name,
    value,
    onChange,
    required,
    disabled,
    placeholder,
    maxLength,
  };

  return (
    <label htmlFor={id} className={`${FORM_LABEL_CLASS} ${className}`}>
      {label}
      {multiline ? (
        <textarea
          {...sharedProps}
          rows={rows}
          className={size === "page" ? FORM_TEXTAREA_CLASS : `${inputClass} min-h-[80px] resize-y`}
        />
      ) : (
        <input
          {...sharedProps}
          type={type}
          autoComplete={autoComplete}
          minLength={minLength}
          autoFocus={autoFocus}
          className={inputClass}
        />
      )}
      {hint ? <span className={FORM_HINT_CLASS}>{hint}</span> : null}
    </label>
  );
}
