"use client";

import { useTheme } from "@/lib/theme/theme-provider";
import { Button } from "@/components/admin/ui/button";
import { AtlasIcon } from "@/components/atlas/icons";

export function AdminThemeToggle() {
  const { resolvedTheme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" aria-hidden>
        <AtlasIcon name="moon" className="h-5 w-5 opacity-50" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
    >
      <AtlasIcon
        name={resolvedTheme === "dark" ? "sun" : "moon"}
        className="h-5 w-5"
      />
    </Button>
  );
}