const BASE_CLASS =
  "w-full appearance-none rounded-[0.7rem] border border-[rgba(217,180,255,0.2)] bg-white/[0.04] text-[#f5edff] outline-none transition-[border-color,background-color,box-shadow,color] duration-200 hover:border-[rgba(199,149,255,0.5)] hover:bg-white/[0.045] focus:border-[rgba(199,149,255,0.92)] focus:shadow-[0_0_0_3px_rgba(167,79,255,0.22)] focus:bg-white/[0.06] disabled:opacity-60 disabled:cursor-not-allowed [color-scheme:dark] [&_option]:bg-[#1a1129] [&_option]:text-[#f5edff] [&_option:checked]:bg-[#2a1b45] [&_option:disabled]:text-[#8f86a3]";
const SIZE_CLASS = {
  default: "px-[0.8rem] py-[0.7rem] pr-[2.5rem] text-[0.95rem]",
  compact: "px-[0.55rem] py-[0.3rem] pr-[2rem] text-[0.72rem]",
};
const OPTION_CLASS = "bg-[#1a1129] text-[#f5edff]";

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
          "pointer-events-none absolute right-[0.9rem] top-1/2 h-2 w-2 -translate-y-[62%] rotate-45 border-b-2 border-r-2 border-current text-[rgba(245,237,255,0.72)]",
          size === "compact" ? "right-[0.65rem] h-[0.42rem] w-[0.42rem]" : "",
          iconClassName,
        )}
        aria-hidden="true"
      />
    </div>
  );
}
