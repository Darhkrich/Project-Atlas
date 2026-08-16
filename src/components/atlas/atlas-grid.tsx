import { cn } from "@/lib/utils";

interface AtlasGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: number; // 1-12
  gap?: number;  // uses same spacing scale
}

const colMap: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  6: "grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
  12: "grid-cols-3 md:grid-cols-4 lg:grid-cols-12",
};

const gapMap: Record<number, string> = {
  0: "gap-0",
  1: "gap-1",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  5: "gap-5",
  6: "gap-6",
  8: "gap-8",
  10: "gap-10",
  12: "gap-12",
  16: "gap-16",
};

export function AtlasGrid({
  children,
  className,
  cols = 1,
  gap = 4,
}: AtlasGridProps) {
  return (
    <div
      className={cn(
        "grid",
        colMap[cols] ?? "grid-cols-1",
        gapMap[gap] ?? "gap-4",
        className,
      )}
    >
      {children}
    </div>
  );
}