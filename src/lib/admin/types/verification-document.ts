export type VerificationDocumentStatus = "submitted" | "missing";

export interface VerificationDocument {
  id: string;
  label: string;
  type: string;
  status: VerificationDocumentStatus;
  uploadedAt?: string;
}