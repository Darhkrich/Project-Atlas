/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  getEmailTemplatesFor,
  getEmailTemplatesVersion,
  subscribeToEmailTemplates,
} from "./store";
import {
  resetAllEmailTemplates,
  resetEmailTemplate,
  updateEmailTemplate,
} from "./mutations";
import type { EmailTemplate, EmailTemplateKey } from "./types";

export function useEmailTemplates(storefrontId: string) {
  const snapshot = useSyncExternalStore(
    subscribeToEmailTemplates,
    getEmailTemplatesVersion,
    () => 0
  );

  const templates = useMemo(
    () => getEmailTemplatesFor(storefrontId),
    [storefrontId, snapshot]
  );

  return {
    templates,
    update: (key: EmailTemplateKey, patch: Partial<EmailTemplate>) =>
      updateEmailTemplate(storefrontId, key, patch),
    reset: (key: EmailTemplateKey) =>
      resetEmailTemplate(storefrontId, key),
    resetAll: () => resetAllEmailTemplates(storefrontId),
  };
}