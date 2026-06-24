import type { ClothingItem } from '@/lib/types';

/** Items you actually own — excludes wishlist (not bought) and archived pieces. */
export const isOwned = (i: ClothingItem) => !i.wishlist && !i.archived;
