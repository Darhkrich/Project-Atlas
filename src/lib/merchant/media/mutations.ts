import { MAX_MEDIA_ASSETS } from "./constants";
import { getMediaFor, setMediaFor } from "./store";
import type { MediaAsset, MediaSource } from "./types";

export interface AddMediaResult {
  ok: boolean;
  asset?: MediaAsset;
  error?: string;
}

export interface AddMediaInput {
  url: string;
  alt?: string;
  source: MediaSource;
  category?: string;
  uploadedBy?: string;
  byteSize?: number;
  width?: number;
  height?: number;
}

export function addMedia(
  storefrontId: string,
  input: AddMediaInput
): AddMediaResult {
  const current = getMediaFor(storefrontId);
  if (current.length >= MAX_MEDIA_ASSETS) {
    return {
      ok: false,
      error:
        "Library is at capacity. Remove an image to add another.",
    };
  }

  const url = input.url.trim();
  if (url.length === 0) {
    return { ok: false, error: "Image has no source." };
  }

  const asset: MediaAsset = {
    id: crypto.randomUUID(),
    url,
    alt: (input.alt ?? "").trim(),
    source: input.source,
    category: input.category,
    createdAt: Date.now(),
    uploadedBy: input.uploadedBy,
    byteSize: input.byteSize,
    width: input.width,
    height: input.height,
  };

  setMediaFor(storefrontId, [asset, ...current]);
  return { ok: true, asset };
}

export function removeMedia(storefrontId: string, id: string): void {
  const current = getMediaFor(storefrontId);
  setMediaFor(
    storefrontId,
    current.filter((a) => a.id !== id)
  );
}

export function updateMediaAlt(
  storefrontId: string,
  id: string,
  alt: string
): void {
  const current = getMediaFor(storefrontId);
  const next = current.map((a) =>
    a.id === id ? { ...a, alt: alt.trim() } : a
  );
  setMediaFor(storefrontId, next);
}