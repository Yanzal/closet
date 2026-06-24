/**
 * Supabase client — created only when the project URL + anon key are configured (via EXPO_PUBLIC_*).
 * When they're absent the app runs exactly as before: local-only, no accounts. The anon key is a
 * public client key by design; Row-Level Security (see SUPABASE_SETUP.md) is what protects data.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const ANON = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

/** Whether accounts/sync are configured. Consistent on server + client so the UI gates the same way. */
export const supabaseEnabled = URL.length > 0 && ANON.length > 0;

// During the web static export the app is rendered in Node (no `window`). Creating the client there
// would make supabase-js's auth touch browser storage and crash the build, so we only instantiate it
// in a real runtime (browser or native), never during server rendering.
const isServerRender = Platform.OS === 'web' && typeof window === 'undefined';

export const supabase: SupabaseClient | null =
  supabaseEnabled && !isServerRender
    ? createClient(URL, ANON, {
        auth: {
          storage: AsyncStorage,
          autoRefreshToken: true,
          persistSession: true,
          // GitHub Pages has no auth redirect flow; we use email/password only.
          detectSessionInUrl: false,
        },
      })
    : null;

/** Storage bucket holding per-user item photos (kept for future image offloading). */
export const PHOTO_BUCKET = 'closet';
