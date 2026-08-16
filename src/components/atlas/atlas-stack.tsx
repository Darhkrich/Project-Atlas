import { cn } from "@/lib/utils";

interface AtlasStackProps {
  children: React.ReactNode;
  className?: string;
  gap?: number; // spacing scale 0-20
  as?: "div" | "section";
}

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
  20: "gap-20",
};

export function AtlasStack({
  children,
  className,
  gap = 4,
  as: Component = "div",
}: AtlasStackProps) {
  return (
    <Component className={cn("flex flex-col", gapMap[gap] ?? "gap-4", className)}>
      {children}
    </Component>
  );
}