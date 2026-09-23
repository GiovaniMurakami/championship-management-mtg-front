import { Children } from "react";
import * as RadixTabs from "@radix-ui/react-tabs";

function TabItem({ value, label, count }) {
  return (
    <RadixTabs.Trigger
      value={value}
      className="group flex shrink-0 cursor-pointer items-center gap-2 rounded-lg border-none bg-transparent px-4 py-2 text-[0.9rem] font-semibold text-text-muted transition-all duration-150 hover:text-text-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-soft data-[state=active]:bg-surface data-[state=active]:text-text-main data-[state=active]:shadow-sm max-md:px-3 max-md:text-[0.85rem]"
    >
      {label}
      {count !== undefined && (
        <span className="rounded-full bg-surface-soft px-[0.45rem] py-[0.1rem] text-[0.75rem] font-semibold leading-[1.4] text-text-soft group-data-[state=active]:bg-brand-soft group-data-[state=active]:text-brand">
          {count}
        </span>
      )}
    </RadixTabs.Trigger>
  );
}

export function Tabs({ value, onChange, children, className = "" }) {
  return (
    <RadixTabs.Root value={value} onValueChange={onChange}>
      <RadixTabs.List
        className={`mb-6 flex w-fit max-w-full gap-1 overflow-x-auto rounded-xl bg-surface-soft p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
      >
        {Children.map(children, (child) => {
          if (!child) return null;
          return <TabItem {...child.props} />;
        })}
      </RadixTabs.List>
    </RadixTabs.Root>
  );
}

Tabs.Item = function TabsItem() { return null; };
