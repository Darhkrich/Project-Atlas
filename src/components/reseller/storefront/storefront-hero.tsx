import type { StorefrontConfig } from "@/lib/storefront/types";
import { ClassicHero } from "./heroes/classic-hero";
import { SplitHero } from "./heroes/split-hero";
import { CenteredHero } from "./heroes/centered-hero";
import { CommerceHero } from "./heroes/commerce-hero";
import { PromotionalHero } from "./heroes/promotional-hero";

interface StorefrontHeroProps {
  config: StorefrontConfig;
  mode: "preview" | "public";
}

export function StorefrontHero({ config, mode }: StorefrontHeroProps) {
  if (!config.hero.enabled) return null;

  let heroComponent;
  switch (config.hero.template) {
    case "classic":
      heroComponent = <ClassicHero config={config} mode={mode} />;
      break;
    case "split":
      heroComponent = <SplitHero config={config} mode={mode} />;
      break;
    case "centered":
      heroComponent = <CenteredHero config={config} mode={mode} />;
      break;
    case "commerce":
      heroComponent = <CommerceHero config={config} mode={mode} />;
      break;
    case "promotional":
      heroComponent = <PromotionalHero config={config} mode={mode} />;
      break;
    default:
      heroComponent = <ClassicHero config={config} mode={mode} />;
  }

  return (
    <>
      {mode === "preview" && (
        <div className="fixed top-16 right-4 z-50 bg-black text-white text-xs px-2 py-1 rounded">
          Hero: {config.hero.template}
        </div>
      )}
      {heroComponent}
    </>
  );
}