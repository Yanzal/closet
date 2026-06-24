/**
 * Auto-tag a garment photo into structured attributes for the batch-add flow.
 *
 * Order of preference:
 *   1. A configured vision endpoint (home server / cloud) — fills everything the model returns.
 *   2. Local heuristics: web dominant-colour guess + sensible category-based season defaults.
 * Anything not confidently known is left blank for the user to confirm in the results list.
 */
import { guessColors } from '@/lib/ai/palette';
import { remoteClassify } from '@/lib/ai/remote';
import { CATEGORY_KEYS, COLOR_OPTIONS, SEASONS } from '@/lib/categories';
import { MATERIALS, OCCASIONS, PATTERNS } from '@/lib/attributes';
import type { Category, Season } from '@/lib/types';

export interface GarmentTags {
  name: string;
  category: Category;
  colors: string[];
  seasons: Season[];
  occasions?: string[];
  material?: string[];
  pattern?: string;
}

const SEASON_DEFAULT: Partial<Record<Category, Season[]>> = {
  Outerwear: ['Fall', 'Winter'],
  Dresses: ['Spring', 'Summer'],
  Shoes: ['Spring', 'Summer', 'Fall', 'Winter'],
};

/** Keep only values that belong to a known option set (case-insensitive), preserving canonical casing. */
function clean<T extends string>(input: unknown, allowed: readonly T[]): T[] {
  if (!Array.isArray(input)) input = input != null ? [input] : [];
  const lc = new Map(allowed.map((a) => [a.toLowerCase(), a]));
  const out: T[] = [];
  for (const v of input as unknown[]) {
    const hit = typeof v === 'string' ? lc.get(v.toLowerCase()) : undefined;
    if (hit && !out.includes(hit)) out.push(hit);
  }
  return out;
}

function one<T extends string>(input: unknown, allowed: readonly T[]): T | undefined {
  return clean(input, allowed)[0];
}

export async function classifyGarment(uri: string): Promise<GarmentTags> {
  const colorNames = COLOR_OPTIONS.map((c) => c.name);

  // 1. Remote vision model, if the user has pointed at one.
  const remote = await remoteClassify(uri);
  if (remote) {
    const category = one(remote.category, CATEGORY_KEYS) ?? 'Tops';
    return {
      name: typeof remote.name === 'string' ? remote.name : '',
      category,
      colors: clean(remote.colors, colorNames),
      seasons: clean(remote.seasons, SEASONS),
      occasions: clean(remote.occasions, OCCASIONS),
      material: clean(remote.material, MATERIALS),
      pattern: one(remote.pattern, PATTERNS),
    };
  }

  // 2. Local fallback: guess colours on web, default seasons from category.
  const colors = await guessColors(uri);
  const category: Category = 'Tops';
  return {
    name: '',
    category,
    colors,
    seasons: SEASON_DEFAULT[category] ?? [],
  };
}
