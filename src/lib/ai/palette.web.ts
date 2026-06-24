/**
 * Dominant-colour guess from an image — web implementation.
 *
 * Draws the (already background-removed) image to a small canvas, buckets the non-transparent /
 * non-near-white pixels, finds the most common colours, and maps them to the app's COLOR_OPTIONS by
 * nearest RGB distance. Returns up to two colour names. Runs 100% in the browser, no network.
 */
import { COLOR_OPTIONS } from '@/lib/categories';

const SWATCHES = COLOR_OPTIONS.map((c) => ({
  name: c.name,
  rgb: hexToRgb(c.hex),
}));

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function nearestSwatch(r: number, g: number, b: number): string {
  let best = SWATCHES[0].name;
  let bestD = Infinity;
  for (const s of SWATCHES) {
    const d = (s.rgb[0] - r) ** 2 + (s.rgb[1] - g) ** 2 + (s.rgb[2] - b) ** 2;
    if (d < bestD) {
      bestD = d;
      best = s.name;
    }
  }
  return best;
}

export async function guessColors(uri: string): Promise<string[]> {
  try {
    const img = await loadImage(uri);
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return [];
    ctx.drawImage(img, 0, 0, size, size);
    const { data } = ctx.getImageData(0, 0, size, size);

    // Tally how many pixels map to each app colour, skipping background-ish pixels.
    const votes: Record<string, number> = {};
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      if (a < 200) continue; // transparent (cut-out background)
      if (r > 244 && g > 244 && b > 244) continue; // near-white composite background
      const name = nearestSwatch(r, g, b);
      votes[name] = (votes[name] ?? 0) + 1;
    }

    const ranked = Object.entries(votes).sort((a, b) => b[1] - a[1]);
    if (!ranked.length) return [];
    const total = ranked.reduce((sum, [, n]) => sum + n, 0);
    // Keep the top colour, plus a strong second if it's a meaningful share.
    const picks = [ranked[0][0]];
    if (ranked[1] && ranked[1][1] / total > 0.25) picks.push(ranked[1][0]);
    return picks;
  } catch {
    return [];
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
