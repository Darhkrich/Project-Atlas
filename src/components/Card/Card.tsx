/**
 * Atlas Card
 *
 * A reusable surface primitive for grouping related content.
 */

import clsx from "clsx";

import styles from "./Card.module.css";

import type { CardProps } from "./Card.types";

const paddingClasses = {
  none: styles.paddingNone,
  sm: styles.paddingSm,
  md: styles.paddingMd,
  lg: styles.paddingLg,
} as const;

export function Card({
  children,
  variant = "default",
  padding = "md",
  header,
  footer,
  className,
  ...props
}: Readonly<CardProps>) {
  return (
    <div
      className={clsx(
        styles.card,
        styles[variant],
        paddingClasses[padding],
        className,
      )}
      {...props}
    >
      {header && (
        <div className={styles.header}>
          {header}
        </div>
      )}

      <div>
        {children}
      </div>

      {footer && (
        <div className={styles.footer}>
          {footer}
        </div>
      )}
    </div>
  );
}