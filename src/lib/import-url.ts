/**
 * Import an item from an online-store product link.
 *
 * A browser can't read another site's page directly (same-origin policy), so we fetch the product
 * page through a public CORS proxy and parse its Open Graph / meta tags to pull the photo, title,
 * brand and price. Works for most stores that expose standard product metadata. A self-hosted proxy
 * can replace the public one later for reliability/privacy.
 */
import { supabase } from '@/lib/supabase';
import type { Category } from '@/lib/types';

export interface ImportedItem {
  name: string;
  image?: string;
  brand?: string;
  price?: number;
  category: Category;
  sourceUrl: string;
}

const PROXIES = [
  (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
  (u: string) => `https://corsproxy.io/?url=${encodeURIComponent(u)}`,
];

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

function meta(html: string, prop: string): string | undefined {
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name|itemprop)=["']${prop}["'][^>]*content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name|itemprop)=["']${prop}["']`, 'i'),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return decodeEntities(m[1]);
  }
  return undefined;
}

const CATEGORY_HINTS: [RegExp, Category][] = [
  [/\b(cap|hat|beanie|visor|bucket)\b/i, 'Headwear'],
  [/\b(short|jean|trouser|pant|chino|skirt|legging|jogger|sweatpant)\b/i, 'Bottoms'],
  [/\b(jacket|coat|blazer|parka|cardigan|gilet|vest|outerwear)\b/i, 'Outerwear'],
  [/\b(dress|gown|jumpsuit)\b/i, 'Dresses'],
  [/\b(sneaker|shoe|boot|heel|loafer|sandal|trainer|footwear)\b/i, 'Shoes'],
  [/\b(bag|tote|backpack|clutch|purse|crossbody)\b/i, 'Bags'],
  [/\b(sunglass|belt|scarf|watch|jewel|glove|necklace|earring)\b/i, 'Accessories'],
  [/\b(hoodie|tee|t-shirt|shirt|top|sweater|sweatshirt|blouse|polo|tank|knit|jumper)\b/i, 'Tops'],
];

function guessCategory(text: string): Category {
  for (const [re, cat] of CATEGORY_HINTS) if (re.test(text)) return cat;
  return 'Tops';
}

function parsePrice(html: string): number | undefined {
  const raw = meta(html, 'product:price:amount') ?? meta(html, 'og:price:amount') ?? meta(html, 'price');
  if (raw) {
    const n = Number(raw.replace(/[^0-9.]/g, ''));
    if (Number.isFinite(n) && n > 0) return n;
  }
  return undefined;
}

/** Preferred path: our own Supabase Edge Function (server-side fetch, real User-Agent, no CORS). */
async function fetchViaEdge(url: string): Promise<string | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.functions.invoke('import-proxy', { body: { url } });
    if (error || !data?.ok || typeof data.html !== 'string') return null;
    return data.html.length > 200 ? data.html : null;
  } catch {
    return null;
  }
}

async function fetchHtml(url: string): Promise<string | null> {
  const edge = await fetchViaEdge(url);
  if (edge) return edge;

  // Fallback: public CORS proxies (flaky, but works without the edge function deployed).
  for (const proxy of PROXIES) {
    try {
      const res = await fetch(proxy(url));
      if (!res.ok) continue;
      const text = await res.text();
      if (text && text.length > 200) return text;
    } catch {
      // try next proxy
    }
  }
  return null;
}

export async function importFromUrl(rawUrl: string): Promise<ImportedItem | null> {
  let url = rawUrl.trim();
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  let host = '';
  try {
    host = new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }

  const html = await fetchHtml(url);
  if (!html) return null;

  const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1];
  const name = meta(html, 'og:title') ?? (titleTag ? decodeEntities(titleTag) : '') ?? '';
  const image = meta(html, 'og:image') ?? meta(html, 'twitter:image');
  const siteName = meta(html, 'og:site_name');
  // Brand: prefer og:site_name, else the second-level domain (e.g. "uniqlo" from uniqlo.com).
  const brand = siteName ?? host.split('.').slice(-2, -1)[0]?.replace(/^\w/, (c) => c.toUpperCase());

  if (!name && !image) return null;

  return {
    name: name || `Item from ${host}`,
    image,
    brand,
    price: parsePrice(html),
    category: guessCategory(`${name} ${meta(html, 'og:description') ?? ''}`),
    sourceUrl: url,
  };
}
