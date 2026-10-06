// lib/admin/hooks/use-focus-trap.ts
"use client";

import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE)
  ).filter((node) => {
    // offsetParent is null for display:none elements AND for some
    // fixed-position elements that are actually visible. Fall back to
    // a bounding-box check so we don't skip legitimate targets.
    if (node.offsetParent !== null) return true;
    const rect = node.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  });
} 

export function useFocusTrap<T extends HTMLElement>(
  isOpen: boolean,
  onClose: () => void
): RefObject<T | null> {
  const ref = useRef<T>(null);
  const onCloseRef = useRef(onClose);
  const previousActiveRef = useRef<HTMLElement | null>(null);

  // Keep the latest onClose without re-running the trap effect.
  // Callers pass inline arrows (e.g. () => setOpen(false)), which would
  // otherwise cause the effect to tear down and re-run on every render
  // of the parent — yanking focus back to the first focusable element
  // mid-interaction.
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen || typeof document === "undefined") return;
    const el = ref.current;
    if (!el) return;

    previousActiveRef.current = document.activeElement as HTMLElement | null;

    // Move focus inside the trap.
    const focusables = getFocusable(el);
    if (focusables.length > 0) {
      focusables[0].focus();
    } else {
      if (!el.hasAttribute("tabindex")) {
        el.setAttribute("tabindex", "-1");
      }
      el.focus();
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const items = getFocusable(el);
      if (items.length === 0) {
        event.preventDefault();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;

      // Restore focus only if the previously-active element is still in
      // the DOM. Guards against focusing a detached node after navigation.
      const previous = previousActiveRef.current;
      if (previous && document.contains(previous)) {
        previous.focus();
      }
      previousActiveRef.current = null;
    };
  }, [isOpen]);

  return ref;
}