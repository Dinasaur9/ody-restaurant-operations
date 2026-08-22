/**
 * Ody's visual foundation is calm, warm, and operationally focused.
 * Neutral surfaces carry most of the interface while violet marks primary
 * actions and lime draws attention to live operational information.
 */
export const palette = {
  white: "#FFFFFF",
  black: "#171713",

  stone50: "#FAFAF7",
  stone100: "#F5F4EF",
  stone200: "#EBE9E1",
  stone300: "#DDDAD0",
  stone400: "#AAA69B",
  stone500: "#7B786F",
  stone600: "#5E5B54",
  stone700: "#403E39",
  stone800: "#292823",
  stone900: "#1B1A17",

  violet50: "#F5F3FF",
  violet100: "#ECE8FF",
  violet200: "#D9D1FF",
  violet400: "#8A78E8",
  violet500: "#6D5BD0",
  violet600: "#5C49C2",
  violet700: "#4938A5",

  lime100: "#F2FFD0",
  lime300: "#DFFF72",
  lime500: "#A8C72D",

  green50: "#EAF8EF",
  green500: "#2F8B57",
  amber50: "#FFF5DC",
  amber500: "#A96A10",
  red50: "#FDECEA",
  red500: "#C8493E",
  blue50: "#EAF3FD",
  blue500: "#3479B9",
} as const;

export const colors = {
  background: palette.stone100,
  backgroundSubtle: palette.stone50,
  surface: palette.white,
  surfaceMuted: palette.stone100,
  surfaceStrong: palette.stone900,

  text: palette.stone900,
  textMuted: palette.stone500,
  textSubtle: palette.stone400,
  textInverse: palette.white,

  border: palette.stone200,
  borderStrong: palette.stone300,
  focusRing: palette.violet200,

  primary: palette.violet500,
  primaryHover: palette.violet600,
  primaryPressed: palette.violet700,
  primarySoft: palette.violet100,
  accent: palette.lime300,

  success: palette.green500,
  successSoft: palette.green50,
  warning: palette.amber500,
  warningSoft: palette.amber50,
  danger: palette.red500,
  dangerSoft: palette.red50,
  info: palette.blue500,
  infoSoft: palette.blue50,
  disabled: palette.stone300,
} as const;

export const fontFamilies = {
  sans: "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif",
  display: "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif",
  mono: "ui-monospace, SFMono-Regular, Menlo, monospace",
} as const;

export const fontSizes = {
  micro: 10,
  caption: 12,
  body: 14,
  bodyLarge: 16,
  heading3: 18,
  heading2: 22,
  heading1: 28,
  display: 36,
} as const;

export const lineHeights = {
  micro: 14,
  caption: 17,
  body: 21,
  bodyLarge: 24,
  heading3: 24,
  heading2: 29,
  heading1: 35,
  display: 42,
} as const;

export const fontWeights = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  extraBold: "800",
} as const;

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

export const radii = {
  none: 0,
  small: 8,
  medium: 12,
  large: 18,
  extraLarge: 24,
  pill: 999,
} as const;

export const borders = {
  hairline: 1,
  emphasized: 2,
} as const;

export const shadows = {
  subtle: {
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
    boxShadow: "0 1px 2px rgba(23, 23, 19, 0.04)",
  },
  card: {
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 3,
    boxShadow:
      "0 1px 2px rgba(23, 23, 19, 0.03), 0 8px 24px rgba(23, 23, 19, 0.05)",
  },
  overlay: {
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.14,
    shadowRadius: 42,
    elevation: 12,
    boxShadow: "0 18px 48px rgba(23, 23, 19, 0.16)",
  },
} as const;

export const layout = {
  sidebarWidth: 240,
  contentMaxWidth: 1440,
  pageGutterMobile: spacing[4],
  pageGutterDesktop: spacing[8],
  gridGap: spacing[5],
  minimumTouchTarget: 44,
  breakpoints: {
    tablet: 768,
    desktop: 1100,
    wide: 1440,
  },
} as const;

export const motion = {
  durationFast: 120,
  durationNormal: 180,
  durationSlow: 260,
  easingStandard: "cubic-bezier(0.2, 0, 0, 1)",
} as const;
