/**
 * Local-first sync between the zustand closet store and Supabase.
 *
 * - pullAll: load the signed-in user's wardrobe from the cloud into the store (on login).
 * - startSync: subscribe to store changes and write them through, row-by-row. Each table row is
 *   { user_id, id, data: <full object as jsonb> }. Failed pushes (e.g. offline) leave the local
 *   "last synced" snapshot untouched, so they retry on the next change or when the device reconnects.
 *
 * The store stays the source of truth for the UI, so browsing/editing works offline; this just keeps
 * the cloud in step. Conflict policy is last-write-wins, which is fine for one user across their own
 * devices. Images are currently stored inline in the row (data URL) — fine for small wardrobes; can be
 * offloaded to Storage later without changing this contract.
 */
import { supabase } from '@/lib/supabase';
import { useCloset, type RemoteSnapshot } from '@/store/closet';
import type { AppSettings } from '@/lib/types';

const TABLES = ['items', 'collections', 'outfits', 'calendar', 'trips'] as const;
type Table = (typeof TABLES)[number];

type WithId = { id: string };

const last: Record<Table, Map<string, string>> = {
  items: new Map(),
  collections: new Map(),
  outfits: new Map(),
  calendar: new Map(),
  trips: new Map(),
};
let lastProfile = '';

function groups() {
  const s = useCloset.getState();
  return {
    items: s.items as WithId[],
    collections: s.collections as WithId[],
    outfits: s.outfits as WithId[],
    calendar: s.calendar as WithId[],
    trips: s.trips as WithId[],
  };
}

/** Seed the "last synced" snapshot from the cloud data, so local-only rows are seen as new and pushed. */
function seedSnapshotFrom(snap: RemoteSnapshot) {
  const cloud: Record<Table, WithId[]> = {
    items: snap.items,
    collections: snap.collections,
    outfits: snap.outfits,
    calendar: snap.calendar,
    trips: snap.trips,
  };
  for (const t of TABLES) {
    last[t] = new Map(cloud[t].map((o) => [o.id, JSON.stringify(o)]));
  }
  lastProfile = JSON.stringify({ name: snap.profileName ?? '', settings: snap.settings ?? {} });
}

/**
 * Load the user's data from the cloud. `mode: 'merge'` keeps local-only (unsynced) rows for the same
 * user; `mode: 'replace'` overwrites everything (used when a different user signs in). Returns false
 * on failure (keeps the local cache). The snapshot is seeded from the cloud, so anything local but not
 * yet uploaded gets pushed on the next flush.
 */
export async function pullAll(userId: string, mode: 'merge' | 'replace' = 'merge'): Promise<boolean> {
  const sb = supabase;
  if (!sb) return false;
  try {
    const [prof, ...rows] = await Promise.all([
      sb.from('profiles').select('name,settings').eq('id', userId).maybeSingle(),
      ...TABLES.map((t) => sb.from(t).select('id,data')),
    ]);

    const pick = (i: number) => ((rows[i].data ?? []) as { data: unknown }[]).map((r) => r.data);
    const snap: RemoteSnapshot = {
      profileName: (prof.data?.name as string) ?? '',
      settings: (prof.data?.settings as AppSettings) ?? undefined,
      items: pick(0) as RemoteSnapshot['items'],
      collections: pick(1) as RemoteSnapshot['collections'],
      outfits: pick(2) as RemoteSnapshot['outfits'],
      calendar: pick(3) as RemoteSnapshot['calendar'],
      trips: pick(4) as RemoteSnapshot['trips'],
    };
    if (mode === 'replace') useCloset.getState().hydrateRemote(snap);
    else useCloset.getState().mergeRemote(snap);
    seedSnapshotFrom(snap);
    return true;
  } catch {
    return false;
  }
}

/** Push any pending local changes to the cloud now (e.g. right after a merge-pull). */
export async function flushNow(userId: string) {
  await flush(userId);
}

async function flush(userId: string) {
  const sb = supabase;
  if (!sb) return;
  const g = groups();
  for (const table of TABLES) {
    const lm = last[table];
    const curIds = new Set<string>();
    const upserts: { user_id: string; id: string; data: unknown }[] = [];
    for (const obj of g[table]) {
      curIds.add(obj.id);
      const json = JSON.stringify(obj);
      if (lm.get(obj.id) !== json) upserts.push({ user_id: userId, id: obj.id, data: obj });
    }
    const removed = [...lm.keys()].filter((id) => !curIds.has(id));

    // Upsert one row at a time: item rows embed a base64 photo and can be large, so a single
    // batched request risks exceeding the API size limit (which would drop the whole batch).
    // Per-row also means one failure never blocks the others.
    for (const u of upserts) {
      const { error } = await sb.from(table).upsert(u, { onConflict: 'user_id,id' });
      if (!error) lm.set(u.id, JSON.stringify(u.data));
    }
    if (removed.length) {
      const { error } = await sb.from(table).delete().eq('user_id', userId).in('id', removed);
      if (!error) for (const id of removed) lm.delete(id);
    }
  }

  const s = useCloset.getState();
  const profJson = JSON.stringify({ name: s.profileName, settings: s.settings });
  if (profJson !== lastProfile) {
    const { error } = await sb.from('profiles').upsert({ id: userId, name: s.profileName, settings: s.settings });
    if (!error) lastProfile = profJson;
  }
}

let unsub: (() => void) | null = null;
let onlineHandler: (() => void) | null = null;

/** Begin write-through sync for the given user. Call after pullAll. */
export function startSync(userId: string) {
  stopSync();
  let timer: ReturnType<typeof setTimeout> | null = null;
  const schedule = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => void flush(userId), 400);
  };
  const off = useCloset.subscribe(schedule);

  if (typeof window !== 'undefined' && window.addEventListener) {
    onlineHandler = () => void flush(userId);
    window.addEventListener('online', onlineHandler);
  }

  unsub = () => {
    if (timer) clearTimeout(timer);
    off();
    if (onlineHandler && typeof window !== 'undefined') window.removeEventListener('online', onlineHandler);
    onlineHandler = null;
  };
}

export function stopSync() {
  unsub?.();
  unsub = null;
  for (const t of TABLES) last[t].clear();
  lastProfile = '';
}
