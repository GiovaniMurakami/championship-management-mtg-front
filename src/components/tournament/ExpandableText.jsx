import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { truncateGraphemes } from "../../utils/graphemeText";

const LINE_CLAMP_CLASS = {
  2: "line-clamp-2",
  3: "line-clamp-3",
  4: "line-clamp-4",
  5: "line-clamp-5",
};

function ToggleArrow({ expanded }) {
  return (
    <span
      className={`inline-block h-2 w-2 border-r-2 border-b-2 border-current transition-transform duration-200 ${expanded ? "-rotate-135 translate-y-[2px]" : "rotate-45 -translate-y-[2px]"}`}
      aria-hidden="true"
    />
  );
}

export function ExpandableText({
  text,
  maxLength = 180,
  maxLines,
  className = "",
  buttonClassName = "",
  label,
  headerClassName = "",
  labelClassName = "",
  toggleTextClassName = "",
  alwaysToggle = false,
  initialExpanded = false,
  collapseMode = "preview",
  collapsedLabel = "Mostrar",
  expandedLabel = "Ocultar",
}) {
  const textRef = useRef(null);
  const [expanded, setExpanded] = useState(initialExpanded);
  const [lineOverflow, setLineOverflow] = useState(false);
  const normalized = (text || "").trim();
  const clampLines = Number(maxLines) > 0 ? Number(maxLines) : 0;
  const clampWhenCollapsed = clampLines > 0 && collapseMode !== "section";

  const { preview, truncated } = useMemo(() => {
    const { text: previewText, truncated: isTruncated } = truncateGraphemes(normalized, maxLength);
    return { preview: previewText, truncated: isTruncated };
  }, [maxLength, normalized]);

  useLayoutEffect(() => {
    if (!clampWhenCollapsed || expanded) return undefined;
    const el = textRef.current;
    if (!el) return undefined;

    const measure = () => {
      setLineOverflow(el.scrollHeight > el.clientHeight + 1);
    };
    measure();
    if (typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [clampWhenCollapsed, expanded, normalized, clampLines]);

  if (!normalized) return null;

  const extraLines = (normalized.match(/\n/g) || []).length;
  const likelyOverflow = clampWhenCollapsed && extraLines >= clampLines;
  const shouldCollapse = clampWhenCollapsed ? (lineOverflow || likelyOverflow || truncated) : truncated;
  const canToggle = shouldCollapse || alwaysToggle || collapseMode === "section";
  const visibleText = clampWhenCollapsed || expanded || !truncated || collapseMode === "section"
    ? normalized
    : preview;
  const showBody = collapseMode !== "section" || expanded;
  const clampClass = clampWhenCollapsed && !expanded
    ? (LINE_CLAMP_CLASS[clampLines] || "line-clamp-3")
    : "";

  if (label) {
    return (
      <div className={className}>
        <button
          type="button"
          className={headerClassName || "mb-2 flex w-full items-center justify-between gap-3 border-none bg-transparent p-0 text-left text-brand cursor-pointer hover:text-white transition-colors"}
          onClick={() => canToggle && setExpanded((value) => !value)}
          aria-expanded={canToggle ? expanded : undefined}
        >
          <span className={labelClassName}>{label}</span>
          {canToggle && (
            <span className={`inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.06em] ${toggleTextClassName}`}>
              {expanded ? expandedLabel : collapsedLabel}
              <ToggleArrow expanded={expanded} />
            </span>
          )}
        </button>
        {showBody && <p className="m-0 whitespace-pre-line leading-relaxed">{visibleText}</p>}
      </div>
    );
  }

  return (
    <div className={className}>
      <p ref={textRef} className={`m-0 whitespace-pre-line leading-relaxed ${clampClass}`.trim()}>
        {visibleText}
      </p>
      {shouldCollapse && (
        <button
          type="button"
          className={buttonClassName || "mt-2 inline-flex items-center gap-2 border-none bg-transparent p-0 text-brand text-[0.82rem] font-semibold cursor-pointer hover:text-white transition-colors"}
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
        >
          <ToggleArrow expanded={expanded} />
          {expanded ? "Implodir" : "Mostrar tudo"}
        </button>
      )}
    </div>
  );
}
