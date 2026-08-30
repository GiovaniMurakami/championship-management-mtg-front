import * as RadixTooltip from "@radix-ui/react-tooltip";
import { useState } from "react";

const SIDE_BY_PLACEMENT = {
  auto: "top",
  bottom: "bottom",
  left: "left",
  right: "right",
  top: "top",
};

/**
 * Portaled tooltip with collision handling, keyboard support and accessible timing.
 */
export function Tooltip({
  children,
  content,
  placement = "top",
  className = "",
  tooltipClassName = "",
  ariaLabel,
  focusable = true,
  interactive = false,
}) {
  const [open, setOpen] = useState(false);

  return (
    <RadixTooltip.Provider delayDuration={250} skipDelayDuration={100}>
      <RadixTooltip.Root
        open={open}
        onOpenChange={setOpen}
        disableHoverableContent={!interactive}
      >
        <RadixTooltip.Trigger asChild>
          <span
            className={`relative inline-flex cursor-help ${className}`}
            tabIndex={focusable ? 0 : undefined}
            aria-label={focusable ? ariaLabel : undefined}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={interactive ? undefined : () => setOpen(false)}
          >
            {children}
          </span>
        </RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            side={SIDE_BY_PLACEMENT[placement] || "top"}
            sideOffset={8}
            collisionPadding={8}
            className={`z-[9999] max-w-[min(16rem,calc(100vw-1rem))] whitespace-normal rounded-lg border border-[rgba(251,191,36,0.25)] bg-[#120c1f] px-2.5 py-1.5 text-center text-[0.68rem] font-semibold normal-case tracking-normal text-[#fef3c7] shadow-[0_10px_28px_rgba(0,0,0,0.45)] ring-1 ring-white/[0.04] data-[state=delayed-open]:animate-[fade-in_120ms_ease-out] ${tooltipClassName}`}
          >
            {content}
            <RadixTooltip.Arrow className="fill-[#120c1f]" width={10} height={5} />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
}
