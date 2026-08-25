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
      className={`flex flex-shrink-0 items-center gap-2 px-4 py-2 rounded-lg border-none text-[0.9rem] font-semibold cursor-pointer transition-all duration-150 max-md:px-3 max-md:text-[0.85rem] ${
        isActive
          ? "bg-surface text-text-main shadow-sm"
          : "bg-transparent text-text-muted hover:text-text-main"
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
            ? "bg-brand-soft text-brand"
            : "bg-surface-soft text-text-soft"
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
      className={`flex w-fit max-w-full gap-1 rounded-xl bg-surface-soft p-1 mb-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
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
