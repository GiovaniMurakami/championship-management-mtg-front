import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const SIDE_BY_PLACEMENT = {
  auto: "bottom",
  bottom: "bottom",
  left: "left",
  right: "right",
  top: "top",
};

const GAP = 8;
const VIEWPORT_PAD = 8;

function pickSide(placement, rect) {
  if (placement === "auto") {
    const spaceBelow = window.innerHeight - rect.bottom;
    return spaceBelow < 140 ? "top" : "bottom";
  }
  return SIDE_BY_PLACEMENT[placement] || "top";
}

function positionFor(side, anchor, tip) {
  const tipWidth = tip?.width || 0;
  const tipHeight = tip?.height || 0;
  let top;
  let left;

  if (side === "top") {
    top = anchor.top - tipHeight - GAP;
    left = anchor.left + anchor.width / 2 - tipWidth / 2;
  } else if (side === "bottom") {
    top = anchor.bottom + GAP;
    left = anchor.left + anchor.width / 2 - tipWidth / 2;
  } else if (side === "left") {
    top = anchor.top + anchor.height / 2 - tipHeight / 2;
    left = anchor.left - tipWidth - GAP;
  } else {
    top = anchor.top + anchor.height / 2 - tipHeight / 2;
    left = anchor.right + GAP;
  }

  if (tipWidth) {
    left = Math.max(VIEWPORT_PAD, Math.min(left, window.innerWidth - tipWidth - VIEWPORT_PAD));
  }
  if (tipHeight) {
    top = Math.max(VIEWPORT_PAD, Math.min(top, window.innerHeight - tipHeight - VIEWPORT_PAD));
  }

  return { top, left };
}

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
  const [side, setSide] = useState(SIDE_BY_PLACEMENT[placement] || "top");
  const [anchor, setAnchor] = useState(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const tipRef = useRef(null);
  const closeTimer = useRef(null);

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const closeTooltip = () => {
    cancelClose();
    setOpen(false);
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), interactive ? 180 : 0);
  };

  const openTooltip = (event) => {
    cancelClose();
    const rect = event.currentTarget.getBoundingClientRect();
    const nextSide = pickSide(placement, rect);
    const nextAnchor = {
      top: rect.top,
      bottom: rect.bottom,
      left: rect.left,
      right: rect.right,
      width: rect.width,
      height: rect.height,
    };
    setSide(nextSide);
    setAnchor(nextAnchor);
    setCoords(positionFor(nextSide, nextAnchor));
    setOpen(true);
  };

  useLayoutEffect(() => {
    if (!open || !anchor || !tipRef.current) return;
    const tip = tipRef.current.getBoundingClientRect();
    setCoords(positionFor(side, anchor, tip));
  }, [open, side, anchor, content]);

  return (
    <>
      <span
        className={`relative inline-flex cursor-help ${className}`}
        tabIndex={focusable ? 0 : undefined}
        aria-label={focusable ? ariaLabel : undefined}
        onPointerEnter={openTooltip}
        onMouseEnter={openTooltip}
        onFocus={openTooltip}
        onPointerLeave={scheduleClose}
        onMouseLeave={scheduleClose}
        onBlur={interactive ? undefined : closeTooltip}
      >
        {children}
      </span>
      {open
        ? createPortal(
            <div
              ref={tipRef}
              role="tooltip"
              data-side={side}
              style={{ position: "fixed", top: coords.top, left: coords.left }}
              className={`z-[9999] max-w-[min(16rem,calc(100vw-1rem))] whitespace-normal rounded-lg border border-[rgba(251,191,36,0.25)] bg-[#120c1f] px-2.5 py-1.5 text-center text-[0.68rem] font-semibold normal-case tracking-normal text-[#fef3c7] shadow-[0_10px_28px_rgba(0,0,0,0.45)] ring-1 ring-white/[0.04] ${tooltipClassName}`}
              onPointerEnter={interactive ? () => { cancelClose(); setOpen(true); } : undefined}
              onMouseEnter={interactive ? () => { cancelClose(); setOpen(true); } : undefined}
              onPointerLeave={interactive ? scheduleClose : undefined}
              onMouseLeave={interactive ? scheduleClose : undefined}
            >
              {content}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
