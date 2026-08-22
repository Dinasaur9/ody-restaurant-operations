import {
  borders,
  colors,
  fontFamilies,
  fontSizes,
  fontWeights,
  layout,
  lineHeights,
  motion,
  palette,
  radii,
  shadows,
  spacing,
} from "./tokens";

export const theme = {
  palette,
  colors,
  typography: {
    fontFamilies,
    fontSizes,
    fontWeights,
    lineHeights,
  },
  spacing,
  radii,
  borders,
  shadows,
  layout,
  motion,
} as const;

export type Theme = typeof theme;

export const semanticStates = {
  loading: {
    foreground: colors.textSubtle,
    background: colors.surfaceMuted,
  },
  empty: {
    foreground: colors.textMuted,
    background: colors.backgroundSubtle,
  },
  success: {
    foreground: colors.success,
    background: colors.successSoft,
  },
  warning: {
    foreground: colors.warning,
    background: colors.warningSoft,
  },
  error: {
    foreground: colors.danger,
    background: colors.dangerSoft,
  },
} as const;
