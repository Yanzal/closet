/** Core data model for the digital closet (local-first). */

export type Category =
  | 'Tops'
  | 'Bottoms'
  | 'Outerwear'
  | 'Dresses'
  | 'Shoes'
  | 'Bags'
  | 'Accessories';

export type Season = 'Spring' | 'Summer' | 'Fall' | 'Winter';

export interface ClothingItem {
  id: string;
  name: string;
  /** data: URL (web) or file URI (native). Empty string => render a placeholder tile. */
  photoUri: string;
  category: Category;
  brand?: string;
  /** Color names chosen during tagging, e.g. ['Black', 'Cream']. */
  colors: string[];
  seasons: Season[];
  price?: number;
  wishlist?: boolean;
  dateAdded: string; // ISO timestamp
  wearCount: number;
  lastWornAt?: string; // ISO timestamp
  // --- richer attributes (Item Details v2 / Closet Review) ---
  occasions?: string[];
  material?: string[];
  pattern?: string;
  fit?: string;
  style?: string;
  rating?: number; // 1–5
  labels?: string[];
  notes?: string;
  additionalImages?: string[];
  archived?: boolean;
}

/** A clothing item placed on the outfit canvas (position stored as fractions of canvas size). */
export interface PlacedNode {
  key: string;
  itemId: string;
  cx: number; // center X, 0..1 of canvas width
  cy: number; // center Y, 0..1 of canvas height
  scale: number;
}

export interface Outfit {
  id: string;
  name: string;
  itemIds: string[];
  nodes: PlacedNode[];
  coverUri?: string;
  tags?: string[];
  createdAt: string;
  rating?: number;
  occasion?: string;
  style?: string;
  season?: Season;
  labels?: string[];
  notes?: string;
}

export interface AppSettings {
  weekStartsMonday: boolean;
  tempUnit: 'C' | 'F';
  currency: string;
  country: string;
  language: string;
  homeCity?: string;
}

export interface Collection {
  id: string;
  name: string;
  itemIds: string[];
  coverUri?: string;
}

export interface CalendarEntry {
  id: string;
  date: string; // YYYY-MM-DD
  outfitId?: string;
  itemIds: string[];
  city?: string;
  note?: string;
  // --- OOTD ---
  photos?: string[];
  rating?: number; // 1–5 stars
  label?: string;
  info?: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export interface Trip {
  id: string;
  title: string;
  heroUri?: string;
  city: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  note?: string;
  dayOutfits?: Record<string, string[]>; // 'YYYY-MM-DD' -> outfit ids
  checklist?: ChecklistItem[];
}
