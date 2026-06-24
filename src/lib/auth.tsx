/**
 * Auth state for the app. When Supabase isn't configured, this is a no-op pass-through (the app stays
 * local-only with no login). When it is, it tracks the session, pulls the user's wardrobe on sign-in,
 * starts write-through sync, and wipes local data on sign-out so the next user starts clean.
 */
import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

import { supabase, supabaseEnabled } from '@/lib/supabase';
import { flushNow, pullAll, startSync, stopSync } from '@/lib/sync';
import { useCloset } from '@/store/closet';

interface AuthValue {
  /** True only when Supabase is configured (accounts enabled). */
  enabled: boolean;
  /** Still determining the initial session. */
  loading: boolean;
  /** True once the signed-in user's cloud data has been pulled (so name checks are reliable). */
  synced: boolean;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue>({
  enabled: false,
  loading: false,
  synced: false,
  session: null,
  signIn: async () => ({ error: 'Auth not configured' }),
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(supabaseEnabled);
  const [synced, setSynced] = useState(false);
  const syncingFor = useRef<string | null>(null);

  useEffect(() => {
    if (!supabaseEnabled || !supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Start/stop sync as the signed-in user changes.
  useEffect(() => {
    if (!supabaseEnabled) return;
    const uid = session?.user?.id ?? null;
    if (uid === syncingFor.current) return;

    if (uid) {
      syncingFor.current = uid;
      setSynced(false);
      const store = useCloset.getState();
      // Same user (or first sign-in on a fresh device): keep local-only changes and merge.
      // A different user: replace, so no data leaks between accounts on a shared device.
      const sameUser = !store.ownerUid || store.ownerUid === uid;
      store.setOwnerUid(uid);
      (async () => {
        await pullAll(uid, sameUser ? 'merge' : 'replace');
        startSync(uid);
        await flushNow(uid); // push anything local that wasn't in the cloud yet
        setSynced(true);
      })();
    } else {
      syncingFor.current = null;
      stopSync();
      setSynced(false);
      useCloset.getState().wipeLocal();
      useCloset.getState().setOwnerUid(undefined);
    }
  }, [session?.user?.id]);

  const value: AuthValue = {
    enabled: supabaseEnabled,
    loading,
    synced,
    session,
    signIn: async (email, password) => {
      if (!supabase) return { error: 'Auth not configured' };
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      return { error: error?.message ?? null };
    },
    signOut: async () => {
      if (!supabase) return;
      await supabase.auth.signOut();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
