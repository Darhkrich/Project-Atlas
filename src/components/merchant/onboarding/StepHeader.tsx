"use client";

interface StepHeaderProps {
  title: string;
  description: string;
}

export function StepHeader({ title, description }: StepHeaderProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl">
        {title}
      </h1>
      <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 sm:text-base">
        {description}
      </p>
    </div>
  );
}