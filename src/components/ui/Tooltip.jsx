import { useId } from "react";

const PLACEMENT_CLASSES = {
  top: {
    bubble: "left-1/2 bottom-[calc(100%+0.5rem)] -translate-x-1/2",
    arrow: "left-1/2 top-full -translate-x-1/2 -translate-y-1/2 border-b border-r",
  },
  bottom: {
    bubble: "left-1/2 top-[calc(100%+0.5rem)] -translate-x-1/2",
    arrow: "left-1/2 bottom-full -translate-x-1/2 translate-y-1/2 border-l border-t",
  },
  left: {
    bubble: "right-[calc(100%+0.5rem)] top-1/2 -translate-y-1/2",
    arrow: "left-full top-1/2 -translate-x-1/2 -translate-y-1/2 border-r border-t",
  },
  right: {
    bubble: "left-[calc(100%+0.5rem)] top-1/2 -translate-y-1/2",
    arrow: "right-full top-1/2 translate-x-1/2 -translate-y-1/2 border-b border-l",
  },
};

export function Tooltip({
  children,
  content,
  placement = "top",
  className = "",
  tooltipClassName = "",
  ariaLabel,
}) {
  const tooltipId = useId();
  const placementClasses = PLACEMENT_CLASSES[placement] || PLACEMENT_CLASSES.top;

  return (
    <span
      className={`group relative inline-flex cursor-help ${className}`}
      tabIndex={0}
      aria-label={ariaLabel}
      aria-describedby={tooltipId}
    >
      {children}
      <span
        id={tooltipId}
        role="tooltip"
        className={[
          "pointer-events-none absolute z-50 whitespace-nowrap rounded-lg border border-[rgba(251,191,36,0.25)] bg-[#120c1f] px-2.5 py-1.5 text-[0.68rem] font-semibold normal-case tracking-normal text-[#fef3c7] opacity-0 shadow-[0_10px_28px_rgba(0,0,0,0.45)] ring-1 ring-white/[0.04] transition-all duration-150",
          "scale-95 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100",
          placementClasses.bubble,
          tooltipClassName,
        ].join(" ")}
      >
        {content}
        <span
          className={`absolute h-2 w-2 rotate-45 border-[rgba(251,191,36,0.25)] bg-[#120c1f] ${placementClasses.arrow}`}
        />
      </span>
    </span>
  );
}
