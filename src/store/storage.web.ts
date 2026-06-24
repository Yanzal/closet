/**
 * Persistence backend for the closet store — web (PWA).
 *
 * Backed by IndexedDB (via idb-keyval) instead of localStorage: the closet stores base64 images,
 * which blow past localStorage's ~5MB quota almost immediately. IndexedDB allows hundreds of MB+,
 * and home-screen PWAs get persistent storage on iOS. Shaped like AsyncStorage so zustand's
 * createJSONStorage can use it directly. Migrates any existing localStorage data once.
 */
import { del, get, set } from 'idb-keyval';

export const storage = {
  getItem: async (name: string): Promise<string | null> => {
    const fromIdb = await get<string>(name);
    if (fromIdb != null) return fromIdb;

    // One-time migration from the previous localStorage-backed persistence.
    try {
      const legacy = globalThis.localStorage?.getItem(name);
      if (legacy != null) {
        await set(name, legacy);
        globalThis.localStorage.removeItem(name);
        return legacy;
      }
    } catch {
      // localStorage unavailable — nothing to migrate.
    }
    return null;
  },
  setItem: (name: string, value: string): Promise<void> => set(name, value),
  removeItem: (name: string): Promise<void> => del(name),
};
