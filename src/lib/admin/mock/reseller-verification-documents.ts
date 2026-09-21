import type { VerificationDocument } from "@/lib/admin/types/verification-document";

const now = Date.now();
const day = 86_400_000;
const daysAgo = (n: number) => new Date(now - day * n).toISOString();

/**
 * Mock documents for the four resellers currently in the pending queue.
 * Replaced with real submissions when reseller-side upload ships. The
 * shape is stable either way.
 */
export const mockVerificationDocuments: Record<
  string,
  VerificationDocument[]
> = {
  "RS-002": [
    {
      id: "VD-001",
      label: "Business registration certificate",
      type: "PDF · 412 KB",
      status: "submitted",
      uploadedAt: daysAgo(6),
    },
    {
      id: "VD-002",
      label: "Ghana Card",
      type: "Image · 1.2 MB",
      status: "submitted",
      uploadedAt: daysAgo(5),
    },
    {
      id: "VD-003",
      label: "TIN certificate",
      type: "PDF · 208 KB",
      status: "submitted",
      uploadedAt: daysAgo(4),
    },
  ],
  "RS-009": [
    {
      id: "VD-004",
      label: "Business registration certificate",
      type: "PDF · 380 KB",
      status: "submitted",
      uploadedAt: daysAgo(11),
    },
    {
      id: "VD-005",
      label: "Ghana Card",
      type: "Image · 980 KB",
      status: "submitted",
      uploadedAt: daysAgo(11),
    },
    {
      id: "VD-006",
      label: "Proof of address",
      type: "PDF · —",
      status: "missing",
    },
  ],
  "RS-015": [
    {
      id: "VD-007",
      label: "Business registration certificate",
      type: "PDF · 302 KB",
      status: "submitted",
      uploadedAt: daysAgo(14),
    },
    {
      id: "VD-008",
      label: "Ghana Card",
      type: "Image · —",
      status: "missing",
    },
  ],
  "RS-020": [
    {
      id: "VD-009",
      label: "Business registration certificate",
      type: "PDF · 421 KB",
      status: "submitted",
      uploadedAt: daysAgo(2),
    },
    {
      id: "VD-010",
      label: "Ghana Card",
      type: "Image · 1.1 MB",
      status: "submitted",
      uploadedAt: daysAgo(2),
    },
    {
      id: "VD-011",
      label: "Proof of address",
      type: "PDF · 245 KB",
      status: "submitted",
      uploadedAt: daysAgo(1),
    },
  ],
};

export function documentsFor(id: string): VerificationDocument[] {
  return mockVerificationDocuments[id] ?? [];
}