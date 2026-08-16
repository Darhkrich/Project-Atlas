import { cn } from "@/lib/utils";

interface AtlasCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingMap = {
  none: "p-0",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function AtlasCard({
  children,
  className,
  padding = "md",
}: AtlasCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900",
        paddingMap[padding],
        className,
      )}
    >
      {children}
    </div>
  );
}