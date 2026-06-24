/**
 * Design tokens for the Closet app, tuned to the designer mockups:
 * airy white surfaces, near-black ink, a blue accent, soft rounded cards.
 * The app is light-mode only (see hooks/use-theme.ts), but we keep the
 * light/dark shape so the scaffold's ThemedText/ThemedView keep working.
 */

import '@/global.css';

import { Platform, type ViewStyle } from 'react-native';

/** Raw palette. */
export const palette = {
  white: '#FFFFFF',
  black: '#121316',
  ink: '#17181C', // primary text
  graphite: '#3B3F46',
  slate: '#62666E', // secondary text
  gray: '#8B9098', // muted text
  silver: '#B9BEC6',
  cloud: '#F4F5F7', // element / card background
  mist: '#ECEEF1', // selected / pressed
  hairline: '#E8EAEE', // borders
  blue: '#2F6BFF',
  blueInk: '#1E54E0',
  blueSoft: '#EAF1FF',
  pink: '#F6E7EE',
  lavender: '#EBE9F8',
  mint: '#E6F4EC',
  sky: '#E7F0FB',
  green: '#36B368',
  amber: '#F2A93B',
  danger: '#E5484D',
} as const;

export const Colors = {
  light: {
    text: palette.ink,
    textSecondary: palette.slate,
    textMuted: palette.gray,
    background: palette.white,
    backgroundElement: palette.cloud,
    backgroundSelected: palette.mist,
    border: palette.hairline,
    primary: palette.black,
    onPrimary: palette.white,
    accent: palette.blue,
    accentSoft: palette.blueSoft,
  },
  dark: {
    // App is light-only; mirror light so the theme type stays consistent.
    text: palette.ink,
    textSecondary: palette.slate,
    textMuted: palette.gray,
    background: palette.white,
    backgroundElement: palette.cloud,
    backgroundSelected: palette.mist,
    border: palette.hairline,
    primary: palette.black,
    onPrimary: palette.white,
    accent: palette.blue,
    accentSoft: palette.blueSoft,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
})!;

/** 4pt spacing scale (keeps scaffold's named keys, adds numeric helpers). */
export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
  // numeric aliases used across new screens
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

export const Radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 999,
} as const;

/** Soft elevation. react-native-web maps these to box-shadow on web. */
export const Shadow = {
  card: {
    shadowColor: '#0B1220',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  } as ViewStyle,
  float: {
    shadowColor: '#0B1220',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  } as ViewStyle,
};

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 480; // phone-width canvas, even on the web preview
export const TabBarHeight = 64;
