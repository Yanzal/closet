/**
 * Dominant-colour guess from an image — default (native) implementation.
 *
 * Native pixel access needs a real build (or the Vision model), so this is a no-op for now and the
 * user picks colours manually. The web build (`palette.web.ts`) does real canvas-based analysis.
 */
export async function guessColors(_uri: string): Promise<string[]> {
  return [];
}
