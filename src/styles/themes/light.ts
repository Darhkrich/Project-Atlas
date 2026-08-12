/**
 * Atlas Light Theme
 *
 * Maps semantic UI values to design tokens.
 */

import { colors, shadows } from "../tokens";

export const lightTheme = {
  name: "light",

  background: colors.white,
  surface: colors.slate[50],

  primary: colors.primary[600],

  text: {
    primary: colors.slate[900],
    secondary: colors.slate[600],
    muted: colors.slate[400],
  },

  border: colors.slate[200],

  success: colors.success[500],
  warning: colors.warning[500],
  danger: colors.danger[500],
  info: colors.info[500],

  shadow: shadows.md,
} as const;