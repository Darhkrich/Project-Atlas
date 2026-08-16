import { Button } from "./button";

interface AtlasErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function AtlasErrorState({
  title = "Something went wrong",
  message = "We couldn't load this content. Please try again.",
  onRetry,
  className,
}: AtlasErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 text-center ${className || ""}`}
      role="alert"
    >
      <div className="mb-4 text-danger-500 dark:text-danger-400 text-2xl">!</div>
      <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
        {title}
      </h3>
      <p className="mt-1 max-w-md text-sm text-neutral-600 dark:text-neutral-400">
        {message}
      </p>
      {onRetry && (
        <div className="mt-6">
          <Button variant="outline" onClick={onRetry}>
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}