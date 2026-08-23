import { BTN_DANGER, BTN_GHOST, BTN_PRIMARY, BTN_SECONDARY } from "../../styles/uiClasses";

const VARIANT_CLASS = {
  primary: BTN_PRIMARY,
  secondary: BTN_SECONDARY,
  danger: BTN_DANGER,
  ghost: BTN_GHOST,
};

const SIZE_CLASS = {
  sm: "!px-3 !py-2 text-[0.82rem]",
  md: "!px-4 !py-2.5 text-[0.9rem]",
  lg: "!px-5 !py-3 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  block = false,
  loading = false,
  disabled = false,
  className = "",
  children,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex min-h-10 items-center justify-center gap-2 ${VARIANT_CLASS[variant] ?? VARIANT_CLASS.primary} ${SIZE_CLASS[size] ?? SIZE_CLASS.md} ${block ? "w-full" : ""} ${className}`.trim()}
      {...props}
    >
      {loading ? (
        <span
          className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent"
          aria-hidden="true"
        />
      ) : null}
      {children}
    </button>
  );
}
