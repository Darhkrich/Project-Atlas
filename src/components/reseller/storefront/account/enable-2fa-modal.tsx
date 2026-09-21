/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { AtlasModalShell } from "@/components/atlas/modal-shell";
import { Button } from "@/components/atlas/button";
import { AtlasInput } from "@/components/atlas/Input";

interface Props {
  open: boolean;
  phone: string;
  submitting: boolean;
  onSubmit: () => void;
  onClose: () => void;
}

export function Enable2FAModal({
  open,
  phone,
  submitting,
  onSubmit,
  onClose,
}: Props) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [codeSent, setCodeSent] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCode("");
    setError(null);
    setCodeSent(false);
  }, [open]);

  const valid = code.trim().length === 6;

  const handleSend = () => {
    setCodeSent(true);
    setError(null);
  };

  const handleVerify = () => {
    if (!valid) {
      setError("Enter the 6-digit code.");
      return;
    }
    onSubmit();
  };

  return (
    <AtlasModalShell
      open={open}
      onClose={onClose}
      title="Enable two-factor authentication"
      description={
        phone
          ? "We will send a 6-digit code to " + phone
          : "Add a phone number to your account first."
      }
    >
      <div className="space-y-4">
        {!phone ? (
          <p className="text-sm text-neutral-600">
            Update your profile with a phone number to enable 2FA.
          </p>
        ) : !codeSent ? (
          <div className="space-y-4">
            <p className="text-sm text-neutral-600">
              A code will be sent by SMS. It expires in 10 minutes.
            </p>
            <div className="flex justify-end gap-3 border-t border-neutral-200 pt-3">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSend}>Send code</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <AtlasInput
              label="6-digit code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D+/g, ""));
                setError(null);
              }}
              error={error ?? undefined}
            />

            {error && (
              <p role="alert" className="text-xs text-danger-600">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-3 border-t border-neutral-200 pt-3">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleVerify} disabled={!valid || submitting}>
                {submitting ? "Verifying" : "Verify and enable"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </AtlasModalShell>
  );
}