import * as RadixCheckbox from "@radix-ui/react-checkbox";
import { Check, Minus } from "lucide-react";

const SIZE_CLASS = { sm: "h-4 w-4 rounded-md", md: "h-5 w-5 rounded-md" };

export function Checkbox({ checked, onCheckedChange, onChange, name, value = "on", size = "md", className = "", ...props }) {
  const handleCheckedChange = (nextChecked) => {
    onCheckedChange?.(nextChecked);
    const target = { name, value, type: "checkbox", checked: nextChecked === true };
    onChange?.({ target, currentTarget: target });
  };

  return (
    <RadixCheckbox.Root
      checked={checked}
      onCheckedChange={handleCheckedChange}
      name={name}
      value={value}
      className={`inline-flex shrink-0 cursor-pointer items-center justify-center border border-line-strong bg-white/[0.05] text-white shadow-sm transition-colors hover:border-brand hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-brand data-[state=checked]:bg-brand-strong data-[state=indeterminate]:border-brand data-[state=indeterminate]:bg-brand-strong ${SIZE_CLASS[size] || SIZE_CLASS.md} ${className}`}
      {...props}
    >
      <RadixCheckbox.Indicator className="grid place-items-center">
        {checked === "indeterminate" ? <Minus className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" /> : <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />}
      </RadixCheckbox.Indicator>
    </RadixCheckbox.Root>
  );
}
