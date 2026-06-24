import { palette } from '@/constants/theme';
import type { Category, Season } from '@/lib/types';

/** Display metadata for each clothing category (used for tabs + placeholder tiles). */
export const CATEGORIES: { key: Category; label: string; emoji: string; tint: string }[] = [
  { key: 'Tops', label: 'Tops', emoji: '👕', tint: palette.sky },
  { key: 'Bottoms', label: 'Bottoms', emoji: '👖', tint: palette.lavender },
  { key: 'Outerwear', label: 'Outerwear', emoji: '🧥', tint: palette.cloud },
  { key: 'Dresses', label: 'Dresses', emoji: '👗', tint: palette.pink },
  { key: 'Shoes', label: 'Shoes', emoji: '👟', tint: palette.mist },
  { key: 'Bags', label: 'Bags', emoji: '👜', tint: palette.mint },
  { key: 'Accessories', label: 'Accessories', emoji: '🕶️', tint: palette.blueSoft },
];

export const CATEGORY_KEYS: Category[] = CATEGORIES.map((c) => c.key);

export function categoryMeta(key: Category) {
  return CATEGORIES.find((c) => c.key === key) ?? CATEGORIES[0];
}

/** Color swatches offered during tagging. */
export const COLOR_OPTIONS: { name: string; hex: string }[] = [
  { name: 'Black', hex: '#1B1C1F' },
  { name: 'Gray', hex: '#9AA0A8' },
  { name: 'White', hex: '#F7F7F8' },
  { name: 'Cream', hex: '#EFE7D6' },
  { name: 'Beige', hex: '#D9C7A8' },
  { name: 'Brown', hex: '#7C5A40' },
  { name: 'Navy', hex: '#2A3550' },
  { name: 'Blue', hex: '#3E6DDE' },
  { name: 'Green', hex: '#3F8B5C' },
  { name: 'Olive', hex: '#7A7A45' },
  { name: 'Red', hex: '#C8453B' },
  { name: 'Pink', hex: '#E29CB6' },
  { name: 'Purple', hex: '#7C5BC0' },
  { name: 'Yellow', hex: '#E7C24B' },
];

export function colorHex(name: string): string {
  return COLOR_OPTIONS.find((c) => c.name.toLowerCase() === name.toLowerCase())?.hex ?? '#C4C8CE';
}

export const SEASONS: Season[] = ['Spring', 'Summer', 'Fall', 'Winter'];
