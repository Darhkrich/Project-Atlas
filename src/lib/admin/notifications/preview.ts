// lib/admin/notifications/preview.ts

const SAMPLE_RECIPIENT = "ama.serwaa@example.com";
const SAMPLE_FIRST_NAME = "Ama";

function interpolate(template: string): string {
  return template
    .replace(/\{firstName\}/g, SAMPLE_FIRST_NAME)
    .replace(/\{name\}/g, SAMPLE_FIRST_NAME);
}

export interface EmailPreview {
  subject: string;
  body: string;
  fromName: string;
  fromAddress: string;
  recipient: string;
}

export interface SmsPreview {
  body: string;
  sender: string;
  charCount: number;
  segments: number;
}

export interface PushPreview {
  title: string;
  body: string;
  appName: string;
}

export interface InAppPreview {
  title: string;
  body: string;
}

export function buildEmailPreview(draft: {
  title: string;
  message: string;
}): EmailPreview {
  return {
    subject: interpolate(draft.title),
    body: interpolate(draft.message),
    fromName: "Atlas",
    fromAddress: "no-reply@atlas.com",
    recipient: SAMPLE_RECIPIENT,
  };
}

export function buildSmsPreview(draft: { message: string }): SmsPreview {
  const body = interpolate(draft.message);
  const charCount = body.length;
  return {
    body,
    sender: "ATLAS",
    charCount,
    segments: Math.max(1, Math.ceil(charCount / 160)),
  };
}

export function buildPushPreview(draft: {
  title: string;
  message: string;
}): PushPreview {
  return {
    title: interpolate(draft.title),
    body: interpolate(draft.message),
    appName: "Atlas",
  };
}

export function buildInAppPreview(draft: {
  title: string;
  message: string;
}): InAppPreview {
  return {
    title: interpolate(draft.title),
    body: interpolate(draft.message),
  };
}