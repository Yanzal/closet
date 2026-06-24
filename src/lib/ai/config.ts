/**
 * Optional remote AI endpoints, used as a fallback before the on-device iOS build exists.
 *
 * Set these in a `.env` file (see `.env.example`) so you can test beautify / stylist in Expo Go
 * or the browser by pointing at your home machine or a cloud API. Empty string = disabled, in which
 * case the app uses on-device AI (iOS) / in-browser model (web) / heuristics only.
 *
 * EXPO_PUBLIC_* vars are inlined at build time by Expo; restart the dev server after changing them.
 */
export const BEAUTIFY_URL = process.env.EXPO_PUBLIC_BEAUTIFY_URL ?? '';
export const GENERATE_URL = process.env.EXPO_PUBLIC_GENERATE_URL ?? '';

export const beautifyConfigured = BEAUTIFY_URL.length > 0;
export const generateConfigured = GENERATE_URL.length > 0;
