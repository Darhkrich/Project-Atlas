"use client";

interface ProductSelectCheckboxProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  indeterminate?: boolean;
}

export function ProductSelectCheckbox({
  checked,
  onChange,
  label,
  indeterminate = false,
}: ProductSelectCheckboxProps) {
  return (
    <input
      type="checkbox"
      checked={checked}
      ref={(el) => {
        if (el) el.indeterminate = indeterminate;
      }}
      onChange={(e) => onChange(e.target.checked)}
      aria-label={label}
      className="h-4 w-4 cursor-pointer rounded border-neutral-300 text-brand-600 focus:ring-2 focus:ring-brand-500 dark:border-neutral-600"
    />
  );
}