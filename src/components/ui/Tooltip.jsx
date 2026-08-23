import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const GAP = 8;

function computePosition(triggerRect, tooltipRect, placement) {
  const viewportPadding = 8;
  let top = 0;
  let left = 0;

  switch (placement) {
    case "bottom":
      top = triggerRect.bottom + GAP;
      left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
      break;
    case "left":
      top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
      left = triggerRect.left - tooltipRect.width - GAP;
      break;
    case "right":
      top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
      left = triggerRect.right + GAP;
      break;
    case "top":
    default:
      top = triggerRect.top - tooltipRect.height - GAP;
      left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
      break;
  }

  const maxLeft = window.innerWidth - tooltipRect.width - viewportPadding;
  const maxTop = window.innerHeight - tooltipRect.height - viewportPadding;
  left = Math.min(Math.max(left, viewportPadding), Math.max(viewportPadding, maxLeft));
  top = Math.min(Math.max(top, viewportPadding), Math.max(viewportPadding, maxTop));

  return { top, left };
}

const ARROW_CLASSES = {
  top: "left-1/2 top-full -translate-x-1/2 -translate-y-1/2 border-b border-r",
  bottom: "left-1/2 bottom-full -translate-x-1/2 translate-y-1/2 border-l border-t",
  left: "left-full top-1/2 -translate-x-1/2 -translate-y-1/2 border-r border-t",
  right: "right-full top-1/2 translate-x-1/2 -translate-y-1/2 border-b border-l",
};

/**
 * Tooltip portaled to document.body so overflow:hidden parents cannot clip it.
 */
export function Tooltip({
  children,
  content,
  placement = "top",
  className = "",
  tooltipClassName = "",
  ariaLabel,
  focusable = true,
}) {
  const tooltipId = useId();
  const triggerRef = useRef(null);
  const bubbleRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    const bubble = bubbleRef.current;
    if (!trigger || !bubble) return;

    const next = computePosition(
      trigger.getBoundingClientRect(),
      bubble.getBoundingClientRect(),
      placement
    );
    setCoords(next);
  }, [placement]);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
  }, [open, content, updatePosition]);

  useEffect(() => {
    if (!open) return undefined;

    const handleReposition = () => updatePosition();
    window.addEventListener("scroll", handleReposition, true);
    window.addEventListener("resize", handleReposition);
    return () => {
      window.removeEventListener("scroll", handleReposition, true);
      window.removeEventListener("resize", handleReposition);
    };
  }, [open, updatePosition]);

  const show = () => setOpen(true);
  const hide = () => setOpen(false);

  const bubble = open && typeof document !== "undefined"
    ? createPortal(
      <span
        ref={bubbleRef}
        id={tooltipId}
        role="tooltip"
        style={{ top: coords.top, left: coords.left }}
        className={[
          "pointer-events-none fixed z-[9999] max-w-[min(16rem,calc(100vw-1rem))] whitespace-normal text-center rounded-lg border border-[rgba(251,191,36,0.25)] bg-[#120c1f] px-2.5 py-1.5 text-[0.68rem] font-semibold normal-case tracking-normal text-[#fef3c7] shadow-[0_10px_28px_rgba(0,0,0,0.45)] ring-1 ring-white/[0.04]",
          tooltipClassName,
        ].join(" ")}
      >
        {content}
        <span
          className={`absolute h-2 w-2 rotate-45 border-[rgba(251,191,36,0.25)] bg-[#120c1f] ${ARROW_CLASSES[placement] || ARROW_CLASSES.top}`}
          aria-hidden="true"
        />
      </span>,
      document.body
    )
    : null;

  return (
    <span
      ref={triggerRef}
      className={`relative inline-flex cursor-help ${className}`}
      tabIndex={focusable ? 0 : undefined}
      aria-label={focusable ? ariaLabel : undefined}
      aria-describedby={open ? tooltipId : undefined}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {bubble}
    </span>
  );
}
