/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useRef, useState } from "react";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import {
  MESSAGE_BODY_MAX_LENGTH,
  MESSAGE_BODY_MIN_LENGTH,
} from "@/lib/merchant/support/constants";
import { SEND_MESSAGE_BUTTON } from "@/lib/merchant/support/labels";

interface MessageComposerProps {
  placeholder: string;
  onSend: (body: string) => { ok: boolean; error?: string };
  disabled?: boolean;
  disabledReason?: string;
}

export function MessageComposer({
  placeholder,
  onSend,
  disabled,
  disabledReason,
}: MessageComposerProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!value) return;
    setError(null);
  }, [value]);

  const trimmed = value.trim();
  const canSend =
    !disabled && trimmed.length >= MESSAGE_BODY_MIN_LENGTH;

  const handleSubmit = () => {
    if (!canSend) return;
    const result = onSend(value);
    if (!result.ok) {
      setError(result.error ?? "Could not send the message.");
      return;
    }
    setValue("");
    setError(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  };

  return (
    <div className="border-t border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900 sm:p-4">
      {disabled && disabledReason && (
        <p className="mb-2 text-xs text-neutral-500 dark:text-neutral-400">
          {disabledReason}
        </p>
      )}

      <div className="flex items-end gap-2">
        <label htmlFor="support-composer" className="sr-only">
          {placeholder}
        </label>
        <textarea
          id="support-composer"
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          maxLength={MESSAGE_BODY_MAX_LENGTH}
          rows={1}
          placeholder={placeholder}
          className={cn(
            "min-h-[40px] flex-1 resize-none rounded-lg border bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder-neutral-500",
            error
              ? "border-danger-500 dark:border-danger-700"
              : "border-neutral-300 dark:border-neutral-700",
            disabled && "cursor-not-allowed opacity-60"
          )}
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSend}
          aria-label={SEND_MESSAGE_BUTTON}
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white transition",
            canSend
              ? "bg-brand-600 hover:bg-brand-700"
              : "cursor-not-allowed bg-neutral-300 dark:bg-neutral-700"
          )}
        >
          <AtlasIcon name="send" className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-1.5 flex items-center justify-between text-xs">
        <span className="text-neutral-500 dark:text-neutral-400">
          {error ? (
            <span className="text-danger-600 dark:text-danger-400">
              {error}
            </span>
          ) : (
            "Enter to send. Shift+Enter for a new line."
          )}
        </span>
        {value.length > MESSAGE_BODY_MAX_LENGTH - 200 && (
          <span
            className={cn(
              "tabular-nums",
              value.length >= MESSAGE_BODY_MAX_LENGTH
                ? "text-danger-600 dark:text-danger-400"
                : "text-neutral-500 dark:text-neutral-400"
            )}
          >
            {value.length} / {MESSAGE_BODY_MAX_LENGTH}
          </span>
        )}
      </div>
    </div>
  );
}