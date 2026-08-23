/**
 * Tabs — componente genérico de abas com underline ativo.
 *
 * @example
 * <Tabs value={abaAtiva} onChange={setAbaAtiva}>
 *   <Tabs.Item value="torneios" label="Torneios" count={torneios.length} />
 *   <Tabs.Item value="ranking" label="Ranking" />
 * </Tabs>
 */

function TabItem({ value, label, count, currentValue, onChange }) {
  const isActive = value === currentValue;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      className={`flex flex-shrink-0 items-center gap-2 px-5 py-[0.65rem] bg-transparent border-none border-b-2 -mb-[2px] text-[0.95rem] font-medium cursor-pointer transition-colors duration-200 max-md:px-3 max-md:text-[0.85rem] ${
        isActive
          ? "text-white border-b-[#4f46e5]"
          : "text-[#888] border-b-transparent hover:text-[#c0bfff]"
      }`}
      onClick={() => {
        if (value === currentValue) return;
        onChange(value);
      }}
    >
      {label}
      {count !== undefined && (
        <span className={`text-[0.75rem] font-semibold px-[0.45rem] py-[0.1rem] rounded-full leading-[1.4] ${
          isActive
            ? "bg-[#4f46e5] text-white"
            : "bg-white/[0.06] text-text-soft"
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}

export function Tabs({ value, onChange, children, className = "" }) {
  // Injeta currentValue + onChange em cada TabItem filho
  const items = Array.isArray(children) ? children : [children];
  return (
    <div
      role="tablist"
      className={`flex gap-1 border-b-2 border-[#2a2a3e] mb-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-1 ${className}`}
    >
      {items.map((child) => {
        if (!child) return null;
        return (
          <TabItem
            key={child.props.value}
            currentValue={value}
            onChange={onChange}
            {...child.props}
          />
        );
      })}
    </div>
  );
}

Tabs.Item = function TabsItem() { return null; };
