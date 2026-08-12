/**
 * Atlas Card Types
 */

import type { HTMLAttributes, ReactNode } from "react";

export type CardVariant =
  | "default"
  | "outlined"
  | "elevated"
  | "interactive";

export type CardPadding =
  | "none"
  | "sm"
  | "md"
  | "lg";

export interface CardProps
  extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;

  padding?: CardPadding;

  header?: ReactNode;

  footer?: ReactNode;
}