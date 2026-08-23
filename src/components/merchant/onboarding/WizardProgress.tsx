interface WizardProgressProps {
  steps: string[];
  currentStep: number;
}

export default function WizardProgress({ steps, currentStep }: WizardProgressProps) {
  return (
    <ol className="mb-8 flex flex-wrap items-center gap-2">
      {steps.map((step, idx) => (
        <li key={step} className="flex items-center">
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
              idx < currentStep
                ? "bg-brand-500 text-white"
                : idx === currentStep
                ? "bg-brand-600 text-white"
                : "bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
            }`}
          >
            {idx + 1}
          </span>
          <span
            className={`ml-2 text-sm ${
              idx === currentStep
                ? "font-medium text-neutral-900 dark:text-neutral-100"
                : "text-neutral-500"
            }`}
          >
            {step}
          </span>
          {idx < steps.length - 1 && (
            <span className="mx-2 text-neutral-300 dark:text-neutral-600">—</span>
          )}
        </li>
      ))}
    </ol>
  );
}