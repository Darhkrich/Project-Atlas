import type { StorefrontConfig } from "@/lib/storefront/types";
import { Template1Storefront } from "./templates/template1-storefront";
import { Template2Storefront } from "./templates/template2-storefront";
import { Template3Storefront } from "./templates/template3-storefront";

interface StorefrontRendererProps {
  config: StorefrontConfig;
  mode: "preview" | "public";
}

export function StorefrontRenderer({ config, mode }: StorefrontRendererProps) {
  switch (config.appearance.templateId) {
    case "template1":
      return <Template1Storefront config={config} mode={mode} />;
    case "template2":
      return <Template2Storefront config={config} mode={mode} />;
    case "template3":
      return <Template3Storefront config={config} mode={mode} />;
    default:
      return <Template1Storefront config={config} mode={mode} />;
  }
}