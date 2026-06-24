/**
 * Remote AI calls (platform-agnostic). Used as a fallback when on-device AI isn't available.
 * Both endpoints use a tiny JSON contract so the same server works for web and native:
 *   beautify:  POST { image: <data-url or base64> }  -> { image: <data-url> }
 *   generate:  POST { prompt: string }               -> { text: string }
 * Any failure returns null so callers can fall through to the next option in the chain.
 */
import { BEAUTIFY_URL, CLASSIFY_URL, GENERATE_URL } from '@/lib/ai/config';

export async function remoteRemoveBackground(uri: string): Promise<string | null> {
  if (!BEAUTIFY_URL) return null;
  try {
    const res = await fetch(BEAUTIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: uri }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { image?: string };
    return typeof data.image === 'string' ? data.image : null;
  } catch {
    return null;
  }
}

/**
 * Auto-tag a garment photo via a vision endpoint.
 *   classify: POST { image: <data-url> } -> { name?, category?, colors?[], seasons?[], occasions?[], material?[], pattern? }
 * Returns null if unconfigured or on any failure, so callers fall back to local guesses.
 */
export async function remoteClassify(uri: string): Promise<Record<string, unknown> | null> {
  if (!CLASSIFY_URL) return null;
  try {
    const res = await fetch(CLASSIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: uri }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Record<string, unknown>;
    return data && typeof data === 'object' ? data : null;
  } catch {
    return null;
  }
}

export async function remoteGenerate(prompt: string): Promise<string | null> {
  if (!GENERATE_URL) return null;
  try {
    const res = await fetch(GENERATE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { text?: string; content?: string };
    return data.text ?? data.content ?? null;
  } catch {
    return null;
  }
}
