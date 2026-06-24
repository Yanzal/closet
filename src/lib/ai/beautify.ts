/**
 * Background removal — default (native / non-web) fallback.
 *
 * On iOS the primary path is the Apple Vision native module (`nativeAI.liftSubject`). This runs only
 * when that's absent (e.g. Expo Go): it tries a configured remote endpoint (your home server / cloud
 * API), and otherwise returns the image unchanged. The web build uses `beautify.web.ts` instead.
 * See APPLE_INTELLIGENCE.md and `.env.example`.
 */
import { remoteRemoveBackground } from '@/lib/ai/remote';

export async function removeBackgroundFallback(uri: string): Promise<string> {
  const remote = await remoteRemoveBackground(uri);
  return remote ?? uri;
}
