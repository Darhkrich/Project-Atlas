import { DEFAULT_EMAIL_TEMPLATES } from "./constants";
import {
  getEmailTemplatesFor,
  setEmailTemplatesFor,
} from "./store";
import type { EmailTemplate, EmailTemplateKey, EmailTemplates } from "./types";

export function updateEmailTemplate(
  storefrontId: string,
  key: EmailTemplateKey,
  patch: Partial<EmailTemplate>
): void {
  const current = getEmailTemplatesFor(storefrontId);
  const next: EmailTemplates = {
    ...current,
    [key]: { ...current[key], ...patch },
  };
  setEmailTemplatesFor(storefrontId, next);
}

export function resetEmailTemplate(
  storefrontId: string,
  key: EmailTemplateKey
): void {
  const current = getEmailTemplatesFor(storefrontId);
  const next: EmailTemplates = {
    ...current,
    [key]: DEFAULT_EMAIL_TEMPLATES[key],
  };
  setEmailTemplatesFor(storefrontId, next);
}

export function resetAllEmailTemplates(storefrontId: string): void {
  setEmailTemplatesFor(storefrontId, { ...DEFAULT_EMAIL_TEMPLATES });
}