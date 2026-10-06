"use client";

import { cn } from "@/lib/utils";

export type MessageSide = "own" | "other";

interface MessageBubbleProps {
  authorName: string;
  body: string;
  createdAt: number;
  side: MessageSide;
}

function formatTime(ms: number): string {
  return new Date(ms).toLocaleTimeString("en-GH", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString("en-GH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function MessageBubble({
  authorName,
  body,
  createdAt,
  side,
}: MessageBubbleProps) {
  const isOwn = side === "own";
  return (
    <div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] sm:max-w-[75%]",
          isOwn ? "items-end" : "items-start"
        )}
      >
        <p
          className={cn(
            "mb-0.5 px-1 text-[10px] font-medium uppercase tracking-wide",
            isOwn
              ? "text-right text-neutral-400 dark:text-neutral-500"
              : "text-left text-neutral-500 dark:text-neutral-400"
          )}
        >
          {authorName}
        </p>
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            isOwn
              ? "rounded-br-md bg-brand-600 text-white"
              : "rounded-bl-md bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
          )}
        >
          <p className="whitespace-pre-wrap break-words">{body}</p>
        </div>
        <p
          className={cn(
            "mt-1 px-1 text-[10px]",
            isOwn
              ? "text-right text-neutral-400 dark:text-neutral-500"
              : "text-left text-neutral-500 dark:text-neutral-400"
          )}
          title={formatDate(createdAt) + " " + formatTime(createdAt)}
        >
          {formatTime(createdAt)}
        </p>
      </div>
    </div>
  );
}