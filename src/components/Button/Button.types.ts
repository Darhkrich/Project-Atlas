/**
 * Atlas Button Types
 *
 * Defines the public API for the Atlas Button component.
 */

import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";

export type ButtonSize =
  | "sm"
  | "md"
  | "lg";

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Controls the visual hierarchy of the button.
   */
  variant?: ButtonVariant;

  /**
   * Controls the physical size of the button.
   */
  size?: ButtonSize;

  /**
   * Displays the loading state and prevents interaction.
   */
  loading?: boolean;

  /**
   * Makes the button span the available width.
   */
  fullWidth?: boolean;

  /**
   * Optional content displayed before the button label.
   */
  leftIcon?: ReactNode;

  /**
   * Optional content displayed after the button label.
   */
  rightIcon?: ReactNode;
}