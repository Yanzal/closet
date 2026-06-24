/**
 * On-device, privacy-preserving stylist logic (no network, no cloud).
 * These heuristics work everywhere today; on iOS they can later be upgraded to
 * Apple Intelligence (Foundation Models) behind the same functions — see APPLE_INTELLIGENCE.md.
 */
import { appleIntelligenceAvailable, nativeAI } from '@/lib/ai/native';
import { remoteGenerate } from '@/lib/ai/remote';
import { uid } from '@/lib/id';
import { isOwned } from '@/lib/owned';
import type { Category, ClothingItem, PlacedNode } from '@/lib/types';

export type Warmth = 'warm' | 'mild' | 'cold';

function sample<T>(arr: T[]): T | undefined {
  return arr.length ? arr[Math.floor(Math.random() * arr.length)] : undefined;
}

/** Pleasant default placement per category, used to turn a suggested look into saveable nodes. */
const LAYOUT: Record<Category, { cx: number; cy: number; scale: number }> = {
  Headwear: { cx: 0.5, cy: 0.12, scale: 0.7 },
  Tops: { cx: 0.43, cy: 0.32, scale: 1.1 },
  Outerwear: { cx: 0.62, cy: 0.34, scale: 1.2 },
  Bottoms: { cx: 0.45, cy: 0.62, scale: 1.1 },
  Dresses: { cx: 0.5, cy: 0.45, scale: 1.35 },
  Shoes: { cx: 0.5, cy: 0.85, scale: 0.78 },
  Bags: { cx: 0.8, cy: 0.66, scale: 0.72 },
  Accessories: { cx: 0.22, cy: 0.7, scale: 0.62 },
};

export function buildLookNodes(items: ClothingItem[]): PlacedNode[] {
  const used: Record<string, number> = {};
  return items.map((it) => {
    const base = LAYOUT[it.category] ?? { cx: 0.5, cy: 0.5, scale: 1 };
    const n = used[it.category] ?? 0;
    used[it.category] = n + 1;
    return { key: uid('nd_'), itemId: it.id, cx: base.cx + n * 0.12, cy: base.cy, scale: base.scale };
  });
}

/** Assemble a coherent outfit from the closet, biased toward the chosen warmth/season. */
export function suggestOutfit(items: ClothingItem[], warmth: Warmth = 'mild'): ClothingItem[] {
  const owned = items.filter(isOwned);
  const inSeason = (i: ClothingItem) =>
    warmth === 'cold'
      ? i.seasons.includes('Winter') || i.seasons.includes('Fall')
      : warmth === 'warm'
        ? i.seasons.includes('Summer') || i.seasons.includes('Spring')
        : true;
  const byCat = (c: Category) => {
    const matched = owned.filter((i) => i.category === c && inSeason(i));
    return matched.length ? matched : owned.filter((i) => i.category === c);
  };

  const picks: ClothingItem[] = [];
  const dress = sample(byCat('Dresses'));
  if (dress && Math.random() < 0.4) {
    picks.push(dress);
  } else {
    const top = sample(byCat('Tops'));
    const bottom = sample(byCat('Bottoms'));
    if (top) picks.push(top);
    if (bottom) picks.push(bottom);
  }
  if (warmth === 'cold') {
    const outer = sample(byCat('Outerwear'));
    if (outer) picks.push(outer);
  }
  const shoes = sample(byCat('Shoes'));
  if (shoes) picks.push(shoes);
  const bag = sample(byCat('Bags'));
  if (bag) picks.push(bag);

  return picks;
}

const WARMTH_LABEL: Record<Warmth, string> = {
  warm: 'warm / hot',
  mild: 'mild',
  cold: 'cold',
};

/** One compact line per item so the model has names, categories, colours, and seasons to reason over. */
function describeItem(it: ClothingItem): string {
  const colors = it.colors.length ? it.colors.join('/') : 'unknown colour';
  const seasons = it.seasons.length ? it.seasons.join('/') : 'any season';
  return `id=${it.id} | ${it.category} | "${it.name}" | ${colors} | ${seasons}`;
}

function buildSuggestPrompt(owned: ClothingItem[], warmth: Warmth): string {
  const wardrobe = owned.map(describeItem).join('\n');
  return [
    `You are a personal fashion stylist. From the wardrobe below, choose items that form ONE`,
    `coherent outfit suitable for ${WARMTH_LABEL[warmth]} weather.`,
    ``,
    `Rules:`,
    `- Include either (a Top AND a Bottom) OR a single Dress.`,
    `- Include Shoes if any are available.`,
    `- Optionally add one Outerwear${warmth === 'cold' ? ' (recommended for cold)' : ''}, one Bag, and at most one Accessory.`,
    `- Prefer items whose seasons suit the weather.`,
    `- Keep the colour palette cohesive (about 2-3 colours).`,
    ``,
    `Reply with ONLY the chosen item ids, comma-separated, and nothing else.`,
    ``,
    `Wardrobe:`,
    wardrobe,
  ].join('\n');
}

/** Map the model's reply (a list of ids, however formatted) back to real, de-duplicated items. */
function parseItemIds(reply: string, owned: ClothingItem[]): ClothingItem[] {
  const byId = new Map(owned.map((i) => [i.id, i]));
  const tokens = reply.match(/[A-Za-z0-9_-]+/g) ?? [];
  const seen = new Set<string>();
  const picks: ClothingItem[] = [];
  for (const tok of tokens) {
    const it = byId.get(tok);
    if (it && !seen.has(it.id)) {
      seen.add(it.id);
      picks.push(it);
    }
  }
  return picks;
}

/**
 * Suggest an outfit, preferring on-device Apple Intelligence (Foundation Models) when available
 * and falling back to {@link suggestOutfit}'s heuristics everywhere else (web, Expo Go, older iOS,
 * or any error). The result shape is identical, so callers don't care which path produced it.
 */
export async function suggestOutfitSmart(
  items: ClothingItem[],
  warmth: Warmth = 'mild',
): Promise<ClothingItem[]> {
  const owned = items.filter(isOwned);
  if (owned.length >= 2) {
    const prompt = buildSuggestPrompt(owned, warmth);
    try {
      // 1. On-device Apple Intelligence, then 2. a configured remote LLM.
      let reply: string | null = null;
      if (appleIntelligenceAvailable && nativeAI?.generate) {
        reply = await nativeAI.generate(prompt);
      }
      if (!reply) reply = await remoteGenerate(prompt);

      if (reply) {
        const picks = parseItemIds(reply, owned);
        // Trust the model only if it returned a usable look; otherwise fall through to heuristics.
        if (picks.length >= 2) return picks.slice(0, 6);
      }
    } catch {
      // fall through to heuristics
    }
  }
  return suggestOutfit(items, warmth);
}

/** Score an outfit out of 100 with quick, actionable tips. */
export function rateOutfit(outfitItems: ClothingItem[]): { score: number; tips: string[] } {
  const cats = new Set(outfitItems.map((i) => i.category));
  const colors = new Set(outfitItems.flatMap((i) => i.colors));
  const tips: string[] = [];

  let score = 35;
  const hasBase = (cats.has('Tops') && cats.has('Bottoms')) || cats.has('Dresses');
  if (hasBase) score += 25;
  else tips.push('Add a top and bottom (or a dress) for a complete base.');

  if (cats.has('Shoes')) score += 15;
  else tips.push('Finish the look with shoes.');

  if (cats.has('Outerwear') || cats.has('Bags') || cats.has('Accessories')) score += 12;
  else tips.push('A jacket or bag would pull it together.');

  if (colors.size <= 3) score += 13;
  else if (colors.size <= 4) score += 6;
  else tips.push('Limit to 2–3 colours for a cleaner, more intentional look.');

  if (tips.length === 0) tips.push('Beautifully balanced — wear it with confidence.');

  return { score: Math.max(0, Math.min(100, score)), tips };
}
