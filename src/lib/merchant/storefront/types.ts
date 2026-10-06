export type StorefrontSaveState = "idle" | "saving" | "saved" | "error";

export type StorefrontTabKey =
  | "branding"
  | "template"
  | "sections"
  | "appearance"
  | "shipping"
  | "seo"
  | "domain"
  | "settings";

export type StorefrontStatus = "draft" | "live" | "unpublished";

export interface StorefrontPublishCheck {
  id: string;
  label: string;
  passed: boolean;
  severity: "info" | "warn" | "error";
  hint?: string;
}

export interface PublishLogEntry {
  id: string;
  storefrontId: string;
  action:
    | "created"
    | "published"
    | "unpublished"
    | "domain_connected"
    | "domain_removed";
  at: number;
  actor: string;
}