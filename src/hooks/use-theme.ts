/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';

/** The Closet app is light-mode only (matches the mockups), so always return light. */
export function useTheme() {
  return Colors.light;
}
