"use client";

import { useEffect } from "react";

export interface NotificationKeyboardHandlers {
  onMoveDown?: () => void;
  onMoveUp?: () => void;
  onOpen?: () => void;
  onMarkRead?: () => void;
  onSnooze?: () => void;
  onDismiss?: () => void;
  onMarkAllRead?: () => void;
  onEscape?: () => void;
  onToggleSelect?: () => void;
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!target) return false;
  const el = target as HTMLElement;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (el.isContentEditable) return true;
  return false;
}

export function useNotificationKeyboard(
  enabled: boolean,
  handlers: NotificationKeyboardHandlers
): void {
  useEffect(() => {
    if (!enabled) return;
    if (typeof document === "undefined") return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      switch (event.key) {
        case "ArrowDown":
          if (handlers.onMoveDown) {
            event.preventDefault();
            handlers.onMoveDown();
          }
          return;
        case "ArrowUp":
          if (handlers.onMoveUp) {
            event.preventDefault();
            handlers.onMoveUp();
          }
          return;
        case "Enter":
          if (handlers.onOpen) {
            event.preventDefault();
            handlers.onOpen();
          }
          return;
        case " ":
          if (handlers.onToggleSelect) {
            event.preventDefault();
            handlers.onToggleSelect();
          }
          return;
        case "m":
        case "M":
          if (handlers.onMarkRead) {
            event.preventDefault();
            handlers.onMarkRead();
          }
          return;
        case "s":
        case "S":
          if (handlers.onSnooze) {
            event.preventDefault();
            handlers.onSnooze();
          }
          return;
        case "x":
        case "X":
          if (handlers.onDismiss) {
            event.preventDefault();
            handlers.onDismiss();
          }
          return;
        case "a":
        case "A":
          if (handlers.onMarkAllRead) {
            event.preventDefault();
            handlers.onMarkAllRead();
          }
          return;
        case "Escape":
          if (handlers.onEscape) {
            event.preventDefault();
            handlers.onEscape();
          }
          return;
        default:
          return;
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [enabled, handlers]);
}