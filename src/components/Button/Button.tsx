"use client";

/**
 * Atlas Button
 *
 * A reusable action component built on the Atlas design system.
 * Visual styling is handled entirely by Button.module.css so the
 * component remains independent from the application's page layout.
 */

import clsx from "clsx";

import styles from "./Button.module.css";

import type { ButtonProps } from "./Button.types";

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  type = "button",
  ...props
}: Readonly<ButtonProps>) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      className={clsx(
        styles.button,
        styles[variant],
        styles[size],
        loading && styles.loading,
        fullWidth && styles.fullWidth,
        className,
      )}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <>
          <span className={styles.spinner} aria-hidden="true" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {leftIcon && (
            <span className={styles.icon} aria-hidden="true">
              {leftIcon}
            </span>
          )}

          <span>{children}</span>

          {rightIcon && (
            <span className={styles.icon} aria-hidden="true">
              {rightIcon}
            </span>
          )}
        </>
      )}
    </button>
  );
}