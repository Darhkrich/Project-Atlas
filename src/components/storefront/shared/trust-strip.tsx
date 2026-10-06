import { AtlasIcon } from "@/components/atlas/icons";
import type { AtlasIconName } from "@/components/atlas/icons";
import type { ThemeDefinition } from "@/lib/merchant/storefront/themes";
import type { TrustItem } from "@/types/merchant-storefront";

const TRUST_ICON_MAP: Record<string, AtlasIconName> = {
  shield: "shield",
  package: "package",
  headphones: "headphones",
  lock: "lock",
  "check-circle": "check-circle",
  star: "star",
};

function resolveTrustIcon(name: string): AtlasIconName {
  return TRUST_ICON_MAP[name] ?? "shield";
}

interface TrustStripProps {
  theme: ThemeDefinition;
  items: TrustItem[];
  accentColor: string;
}

export function TrustStrip({ theme, items, accentColor }: TrustStripProps) {
  if (items.length === 0) return null;

  return (
    <section
      role="region"
      aria-label="Store commitments"
      className="w-full"
      style={{
        backgroundColor: `color-mix(in srgb, ${accentColor} 8%, transparent)`,
      }}
    >
      <div
        className={`mx-auto ${theme.layout.containerWidth} px-4 py-10 sm:px-6 sm:py-12 lg:px-8`}
      >
        <ul
          role="list"
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-4">
              <span
                className="inline-flex h-12 w-12 shrink-0 items-center justify-center"
                style={{
                  backgroundColor: `color-mix(in srgb, ${accentColor} 22%, transparent)`,
                  borderRadius: "var(--atlas-radius-lg)",
                }}
              >
                <AtlasIcon
                  name={resolveTrustIcon(item.icon)}
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              </span>
              <span className="text-sm font-semibold leading-snug">
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}