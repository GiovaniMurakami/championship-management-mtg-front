import { useMemo, useState } from "react";
import { truncateGraphemes } from "../../utils/graphemeText";

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
  const [expanded, setExpanded] = useState(initialExpanded);
  const normalized = (text || "").trim();

  const { preview, shouldCollapse } = useMemo(() => {
    const { text: previewText, truncated } = truncateGraphemes(normalized, maxLength);
    return { preview: previewText, shouldCollapse: truncated };
  }, [maxLength, normalized]);

  if (!normalized) return null;

  const canToggle = shouldCollapse || alwaysToggle || collapseMode === "section";
  const visibleText = expanded || !shouldCollapse || collapseMode === "section" ? normalized : preview;
  const showBody = collapseMode !== "section" || expanded;

  if (label) {
    return (
      <div className={className}>
        <button
          type="button"
          className={headerClassName || "mb-2 flex w-full items-center justify-between gap-3 border-none bg-transparent p-0 text-left text-[#c795ff] cursor-pointer hover:text-white transition-colors"}
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
      <p className="m-0 whitespace-pre-line leading-relaxed">{visibleText}</p>
      {shouldCollapse && (
        <button
          type="button"
          className={buttonClassName || "mt-2 inline-flex items-center gap-2 border-none bg-transparent p-0 text-[#c795ff] text-[0.82rem] font-semibold cursor-pointer hover:text-white transition-colors"}
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
