/**
 * Persistence backend for the closet store — default (native).
 * Native uses AsyncStorage. The web build uses `storage.web.ts` (IndexedDB) instead, because the
 * closet keeps base64 images and localStorage's ~5MB cap is far too small. See storage.web.ts.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = AsyncStorage;
