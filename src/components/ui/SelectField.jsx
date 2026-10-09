const BASE_CLASS =
  "w-full appearance-none rounded-lg border border-line bg-white/[0.04] text-text-main outline-none transition-[border-color,background-color,box-shadow,color] duration-200 hover:border-line-strong hover:bg-white/[0.045] focus:border-[rgba(199,149,255,0.92)] focus:shadow-[0_0_0_3px_rgba(167,79,255,0.22)] focus:bg-white/[0.06] disabled:opacity-60 disabled:cursor-not-allowed [color-scheme:dark] [&_option]:bg-[#1a1129] [&_option]:text-text-main [&_option:checked]:bg-[#2a1b45] [&_option:disabled]:text-[#8f86a3]";
const SIZE_CLASS = {
  default: "min-h-11 py-2.5 pl-3.5 pr-10 text-[0.95rem]",
  compact: "min-h-9 py-1.5 pl-3 pr-9 text-[0.85rem]",
};
const ICON_CLASS = {
  default: "right-3.5 h-2 w-2",
  compact: "right-3 h-[0.45rem] w-[0.45rem]",
};
const OPTION_CLASS = "bg-[#1a1129] text-text-main";

function joinClassNames(...values) {
  return values.filter(Boolean).join(" ");
}

export function SelectField({
  options,
  placeholder,
  size = "default",
  className = "",
  wrapperClassName = "",
  iconClassName = "",
  children,
  ...props
}) {
  const resolvedSize = SIZE_CLASS[size] || SIZE_CLASS.default;
  const resolvedIcon = ICON_CLASS[size] || ICON_CLASS.default;

  return (
    <div className={joinClassNames("relative", wrapperClassName)}>
      <select
        {...props}
        className={joinClassNames(BASE_CLASS, resolvedSize, className)}
      >
        {placeholder !== undefined && (
          <option value="" className={OPTION_CLASS}>
            {placeholder}
          </option>
        )}
        {options
          ? options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              className={OPTION_CLASS}
            >
              {option.label}
            </option>
          ))
          : children}
      </select>
      <span
        className={joinClassNames(
          "pointer-events-none absolute top-1/2 -translate-y-[55%] rotate-45 border-b-2 border-r-2 border-current text-[rgba(245,237,255,0.72)]",
          resolvedIcon,
          iconClassName,
        )}
        aria-hidden="true"
      />
    </div>
  );
}
