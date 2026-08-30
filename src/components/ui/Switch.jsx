import * as RadixSwitch from "@radix-ui/react-switch";

export function Switch({ checked, onCheckedChange, label, className = "", ...props }) {
  return (
    <RadixSwitch.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      className={`group inline-flex h-10 min-w-32 cursor-pointer items-center justify-between gap-2 rounded-lg border border-line bg-white/[0.04] p-2 text-xs font-bold uppercase tracking-[0.08em] text-text-muted transition-colors hover:border-line-strong hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:text-[#2ccfb4] ${className}`}
      {...props}
    >
      {label ? <span>{label}</span> : null}
      <span className="relative h-5 w-9 shrink-0 rounded-full bg-[rgba(143,130,173,0.3)] transition-colors group-data-[state=checked]:bg-[rgba(44,207,180,0.32)]">
        <RadixSwitch.Thumb className="block h-4 w-4 translate-x-0.5 translate-y-0.5 rounded-full bg-[#8f82ad] transition-transform will-change-transform data-[state=checked]:translate-x-[1.125rem] data-[state=checked]:bg-[#2ccfb4]" />
      </span>
    </RadixSwitch.Root>
  );
}
