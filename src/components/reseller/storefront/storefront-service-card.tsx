import type { ServiceCategory } from "@/lib/services-page-data";
import type { StorefrontConfig } from "@/lib/storefront/types";
import { getBrandingStyle } from "@/lib/storefront/utils";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";

interface StorefrontServiceCardProps {
  service: ServiceCategory;
  config: StorefrontConfig;
  onClick: () => void;
}

export function StorefrontServiceCard({
  service,
  config,
  onClick,
}: StorefrontServiceCardProps) {
  const brandingStyle = getBrandingStyle(config);

  const radiusClass = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
  }[config.appearance.borderRadius];

  const cardStyleClass = {
    flat: "border border-neutral-200",
    bordered: "border-2 border-neutral-200",
    shadowed: "shadow-md border border-neutral-100",
  }[config.appearance.cardStyle];

  return (
    <button
      onClick={onClick}
      className={`group p-5 text-left bg-white transition hover:shadow-lg ${radiusClass} ${cardStyleClass}`}
      style={brandingStyle}
    >
      <div
        className="h-12 w-12 rounded-lg flex items-center justify-center text-white"
        style={{ backgroundColor: "var(--primary)" }}
      >
        <AtlasIcon name={service.icon as AtlasIconName} className="h-6 w-6" />
      </div>
      <h3 className="mt-3 font-semibold text-neutral-900">{service.name}</h3>
      <p className="mt-1 text-sm text-neutral-500">{service.description}</p>
      <span
        className="mt-3 inline-block text-sm font-medium"
        style={{ color: "var(--primary)" }}
      >
        Buy Now →
      </span>
    </button>
  );
}