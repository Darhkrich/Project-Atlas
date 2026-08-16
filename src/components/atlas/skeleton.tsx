import { cn } from "@/lib/utils";

interface AtlasSkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

export function AtlasSkeleton({
  className,
  variant = "text",
  width,
  height,
}: AtlasSkeletonProps) {
  const base = "animate-pulse bg-neutral-200 dark:bg-neutral-800 rounded";
  const variantClasses = {
    text: "h-4 w-full rounded",
    circular: "rounded-full",
    rectangular: "rounded-md",
  };

  return (
    <div
      className={cn(base, variantClasses[variant], className)}
      style={{ width: width, height: height }}
      aria-hidden="true"
    />
  );
}