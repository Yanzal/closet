import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { storage } from '@/store/storage';
import { uid } from '@/lib/id';
import { makeSeed } from '@/lib/seed';
import type {
  AppSettings,
  CalendarEntry,
  ClothingItem,
  Collection,
  Outfit,
  PlacedNode,
  Trip,
} from '@/lib/types';

const DEFAULT_SETTINGS: AppSettings = {
  weekStartsMonday: false,
  tempUnit: 'C',
  currency: '$',
  country: 'New Zealand',
  language: 'English',
  homeCity: '',
};

export type NewItemInput = Omit<ClothingItem, 'id' | 'dateAdded' | 'wearCount' | 'lastWornAt'> &
  Partial<Pick<ClothingItem, 'wearCount' | 'lastWornAt'>>;

interface ClosetState {
  /** True once persisted state has loaded — gate UI on this to avoid an onboarding flash. */
  hydrated: boolean;
  /** True after first-run seeding so we never re-seed over a user's emptied closet. */
  initialized: boolean;
  profileName: string;
  settings: AppSettings;

  items: ClothingItem[];
  collections: Collection[];
  outfits: Outfit[];
  calendar: CalendarEntry[];
  trips: Trip[];

  setProfileName: (name: string) => void;
  setSettings: (patch: Partial<AppSettings>) => void;
  addItem: (input: NewItemInput) => string;
  updateItem: (id: string, patch: Partial<ClothingItem>) => void;
  removeItem: (id: string) => void;
  logWear: (id: string, dateISO?: string) => void;

  addCollection: (name: string) => string;
  setCollectionItems: (collectionId: string, itemIds: string[]) => void;
  removeCollection: (id: string) => void;

  addOutfit: (input: { name: string; nodes: PlacedNode[] }) => string;
  updateOutfit: (id: string, patch: Partial<Outfit>) => void;
  removeOutfit: (id: string) => void;

  setCalendarEntry: (
    date: string,
    look: Partial<Pick<CalendarEntry, 'outfitId' | 'itemIds' | 'photos' | 'rating' | 'label' | 'info' | 'city' | 'note'>>,
  ) => void;
  removeCalendarEntry: (date: string) => void;

  addTrip: (input: Omit<Trip, 'id'>) => string;
  updateTrip: (id: string, patch: Partial<Trip>) => void;
  removeTrip: (id: string) => void;

  resetToSeed: () => void;
  clearAll: () => void;
  _markHydrated: () => void;
}

export const useCloset = create<ClosetState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      initialized: false,
      profileName: '',
      settings: DEFAULT_SETTINGS,

      items: [],
      collections: [],
      outfits: [],
      calendar: [],
      trips: [],

      setProfileName: (name) => set({ profileName: name }),
      setSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),

      addItem: (input) => {
        const id = uid('it_');
        const item: ClothingItem = {
          wearCount: 0,
          ...input,
          id,
          dateAdded: new Date().toISOString(),
        };
        set((s) => ({ items: [item, ...s.items] }));
        return id;
      },

      updateItem: (id, patch) =>
        set((s) => ({ items: s.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) })),

      removeItem: (id) =>
        set((s) => ({
          items: s.items.filter((it) => it.id !== id),
          collections: s.collections.map((c) => ({
            ...c,
            itemIds: c.itemIds.filter((x) => x !== id),
          })),
        })),

      logWear: (id, dateISO) =>
        set((s) => ({
          items: s.items.map((it) =>
            it.id === id
              ? { ...it, wearCount: it.wearCount + 1, lastWornAt: dateISO ?? new Date().toISOString() }
              : it,
          ),
        })),

      addCollection: (name) => {
        const id = uid('col_');
        set((s) => ({ collections: [...s.collections, { id, name, itemIds: [] }] }));
        return id;
      },

      setCollectionItems: (collectionId, itemIds) =>
        set((s) => ({
          collections: s.collections.map((c) => (c.id === collectionId ? { ...c, itemIds } : c)),
        })),

      removeCollection: (id) =>
        set((s) => ({ collections: s.collections.filter((c) => c.id !== id) })),

      addOutfit: ({ name, nodes }) => {
        const id = uid('out_');
        const outfit: Outfit = {
          id,
          name,
          nodes,
          itemIds: [...new Set(nodes.map((n) => n.itemId))],
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ outfits: [outfit, ...s.outfits] }));
        return id;
      },

      updateOutfit: (id, patch) =>
        set((s) => ({ outfits: s.outfits.map((o) => (o.id === id ? { ...o, ...patch } : o)) })),

      removeOutfit: (id) => set((s) => ({ outfits: s.outfits.filter((o) => o.id !== id) })),

      setCalendarEntry: (date, look) =>
        set((s) => {
          const existing = s.calendar.find((e) => e.date === date);
          const others = s.calendar.filter((e) => e.date !== date);
          const entry: CalendarEntry = {
            id: existing?.id ?? uid('cal_'),
            date,
            ...existing,
            ...look,
            itemIds: look.itemIds ?? existing?.itemIds ?? [],
          };
          return { calendar: [...others, entry] };
        }),

      removeCalendarEntry: (date) =>
        set((s) => ({ calendar: s.calendar.filter((e) => e.date !== date) })),

      addTrip: (input) => {
        const id = uid('trip_');
        set((s) => ({ trips: [{ ...input, id }, ...s.trips] }));
        return id;
      },

      updateTrip: (id, patch) =>
        set((s) => ({ trips: s.trips.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),

      removeTrip: (id) => set((s) => ({ trips: s.trips.filter((t) => t.id !== id) })),

      resetToSeed: () => {
        const { items, collections } = makeSeed();
        set({ items, collections, outfits: [], calendar: [], trips: [], initialized: true });
      },

      clearAll: () =>
        set({ items: [], collections: [], outfits: [], calendar: [], trips: [], initialized: true }),

      _markHydrated: () => set({ hydrated: true }),
    }),
    {
      name: 'closet-store-v1',
      storage: createJSONStorage(() => storage),
      partialize: (s) => ({
        initialized: s.initialized,
        profileName: s.profileName,
        settings: s.settings,
        items: s.items,
        collections: s.collections,
        outfits: s.outfits,
        calendar: s.calendar,
        trips: s.trips,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // First ever launch: populate the sample wardrobe.
        if (!state.initialized) state.resetToSeed();
        state._markHydrated();
      },
    },
  ),
);

/** Virtual "All Clothes" collection id used by the Closet UI. */
export const ALL_CLOTHES_ID = '__all__';
