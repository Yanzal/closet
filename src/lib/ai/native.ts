import { requireOptionalNativeModule } from 'expo-modules-core';
import { Platform } from 'react-native';

import { removeBackgroundFallback } from './beautify';

/**
 * Apple Intelligence runs in a native Expo module ("ClosetAI") that only exists in a real
 * iOS build — never on web or in Expo Go. See APPLE_INTELLIGENCE.md for how to build it on a Mac.
 * Everywhere else `nativeAI` is null and callers fall back to on-device heuristics / no-ops,
 * so the app keeps working in the browser today.
 */
type ClosetAINative = {
  /** Vision foreground-mask "subject lift" → a clean flat product image. */
  liftSubject?: (uri: string) => Promise<string>;
  /** Foundation Models on-device text generation (stylist suggestions / chat). */
  generate?: (prompt: string) => Promise<string>;
};

export const nativeAI = requireOptionalNativeModule<ClosetAINative>('ClosetAI');
export const appleIntelligenceAvailable = Platform.OS === 'ios' && !!nativeAI;

/**
 * Turn a photo into a clean flat product image on a white background. Tries, in order:
 *  1. Apple Vision subject-lift via the native module (real iOS build).
 *  2. A configured remote endpoint — home server / cloud API (works in Expo Go + web).
 *  3. Web only: an in-browser model.
 * Falls back to the original photo if none succeed.
 */
export async function beautifyToFlatImage(uri: string): Promise<string> {
  if (nativeAI?.liftSubject) {
    try {
      return await nativeAI.liftSubject(uri);
    } catch {
      // fall through to the remote / in-browser fallback
    }
  }
  try {
    return await removeBackgroundFallback(uri);
  } catch (e) {
    console.warn('[beautify] background removal failed; keeping original photo:', e);
    return uri;
  }
}
