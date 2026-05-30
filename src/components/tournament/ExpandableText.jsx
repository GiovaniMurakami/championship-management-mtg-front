import { useMemo, useState } from "react";

export function ExpandableText({ text, maxLength = 180, className = "", buttonClassName = "" }) {
  const [expanded, setExpanded] = useState(false);

  const { preview, shouldCollapse } = useMemo(() => {
    const normalized = (text || "").trim();
    if (normalized.length <= maxLength) {
      return { preview: normalized, shouldCollapse: false };
    }
    return { preview: `${normalized.slice(0, maxLength).trimEnd()}...`, shouldCollapse: true };
  }, [maxLength, text]);

  if (!text) return null;

  return (
    <div className={className}>
      <p className="m-0 whitespace-pre-line leading-relaxed">{expanded || !shouldCollapse ? text : preview}</p>
      {shouldCollapse && (
        <button
          type="button"
          className={buttonClassName || "mt-2 border-none bg-transparent p-0 text-[#c795ff] text-[0.82rem] font-semibold cursor-pointer hover:text-white transition-colors"}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? "Mostrar menos" : "Expandir"}
        </button>
      )}
    </div>
  );
}
