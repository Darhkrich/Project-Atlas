"use client";

import clsx from "clsx";

import styles from "./Input.module.css";
import type { InputProps } from "./Input.types";

export function Input({
  label,
  helperText,
  error,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className,
  ...props
}: Readonly<InputProps>) {
  return (
    <div
      className={clsx(
        styles.wrapper,
        fullWidth && styles.fullWidth,
      )}
    >
      {label && (
        <label className={styles.label}>
          {label}
        </label>
      )}

      <div
        className={clsx(
          styles.container,
          error && styles.errorBorder,
        )}
      >
        {leftIcon}

        <input
          className={clsx(
            styles.input,
            className,
          )}
          {...props}
        />

        {rightIcon}
      </div>

      {error ? (
        <span className={styles.error}>
          {error}
        </span>
      ) : (
        helperText && (
          <span className={styles.helper}>
            {helperText}
          </span>
        )
      )}
    </div>
  );
}