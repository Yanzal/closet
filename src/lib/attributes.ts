import { CATEGORY_KEYS, COLOR_OPTIONS, SEASONS } from '@/lib/categories';

export const OCCASIONS = ['Casual', 'Work', 'Formal', 'Date', 'Party', 'Sport', 'Travel', 'Lounge'];
export const MATERIALS = ['Cotton', 'Linen', 'Wool', 'Cashmere', 'Denim', 'Leather', 'Silk', 'Polyester', 'Knit'];
export const PATTERNS = ['Solid', 'Striped', 'Checked', 'Plaid', 'Floral', 'Graphic', 'Dotted', 'Animal'];
export const FITS = ['Slim', 'Regular', 'Relaxed', 'Oversized', 'Cropped'];
export const STYLES = ['Minimal', 'Classic', 'Streetwear', 'Sporty', 'Boho', 'Elegant', 'Preppy', 'Y2K'];

/** Dimensions used by the Closet Review flow — each maps to a ClothingItem field. */
export type ReviewDimKey =
  | 'seasons'
  | 'occasions'
  | 'category'
  | 'colors'
  | 'pattern'
  | 'material'
  | 'style'
  | 'fit';

export type ReviewDim = {
  key: ReviewDimKey;
  label: string;
  time: string;
  options: string[];
  multi: boolean;
};

export const REVIEW_DIMENSIONS: ReviewDim[] = [
  { key: 'seasons', label: 'Season', time: '1–3 min', options: SEASONS as unknown as string[], multi: true },
  { key: 'occasions', label: 'Occasion', time: '3–5 min', options: OCCASIONS, multi: true },
  { key: 'category', label: 'Category', time: '3–5 min', options: CATEGORY_KEYS as unknown as string[], multi: false },
  { key: 'colors', label: 'Color', time: '1–3 min', options: COLOR_OPTIONS.map((c) => c.name), multi: true },
  { key: 'pattern', label: 'Pattern', time: '1–3 min', options: PATTERNS, multi: false },
  { key: 'material', label: 'Material', time: '3–5 min', options: MATERIALS, multi: true },
  { key: 'style', label: 'Style', time: '1–3 min', options: STYLES, multi: false },
  { key: 'fit', label: 'Fit', time: '1–3 min', options: FITS, multi: false },
];
