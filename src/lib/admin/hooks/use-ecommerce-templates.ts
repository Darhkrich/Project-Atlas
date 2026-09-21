"use client";

import { useEffect, useMemo, useState } from "react";
import { mockMerchants } from "@/lib/admin/mock/merchants";
import {
  getTemplates,
  subscribeToTemplateStore,
} from "@/lib/admin/mock/template-store";
import {
  projectTemplateSummary,
  projectTemplates,
  type TemplateSummary,
  type TemplateWithUsage,
} from "@/lib/admin/templates/template-projection";

export interface UseEcommerceTemplatesResult {
  templates: TemplateWithUsage[];
  summary: TemplateSummary;
  loading: boolean;
}

export function useEcommerceTemplates(): UseEcommerceTemplatesResult {
  const [tick, setTick] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 250);
    const unsub = subscribeToTemplateStore(() => setTick((x) => x + 1));
    return () => {
      window.clearTimeout(t);
      unsub();
    };
  }, []);

  const value = useMemo(() => {
    const templates = projectTemplates(getTemplates(), mockMerchants);
    return {
      templates,
      summary: projectTemplateSummary(templates),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  return { ...value, loading };
}