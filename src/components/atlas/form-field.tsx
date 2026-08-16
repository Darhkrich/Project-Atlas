/**
 * Composite wrapper for consistent label/error spacing.
 * Not mandatory; inputs handle label/error internally.
 */
interface AtlasFormFieldProps {
  label?: string;
  htmlFor?: string;
  error?: string;
  helperText?: string;
  children: React.ReactNode;
}

export function AtlasFormField({
  label,
  htmlFor,
  error,
  helperText,
  children,
}: AtlasFormFieldProps) {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={htmlFor}
          className="mb-1.5 block text-sm font-medium text-neutral-800 dark:text-neutral-200"
        >
          {label}
        </label>
      )}
      {children}
      {error && (
        <p className="mt-1.5 text-sm text-danger-600 dark:text-danger-400" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">{helperText}</p>
      )}
    </div>
  );
}