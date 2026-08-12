/**
 * Atlas Dark Theme
 */

import { colors, shadows } from "../tokens";

export const darkTheme = {
  name: "dark",

  background: colors.slate[950],
  surface: colors.slate[900],

  primary: colors.primary[500],

  text: {
    primary: colors.white,
    secondary: colors.slate[300],
    muted: colors.slate[500],
  },

  border: colors.slate[800],

  success: colors.success[500],
  warning: colors.warning[500],
  danger: colors.danger[500],
  info: colors.info[500],

  shadow: shadows.lg,
} as const;