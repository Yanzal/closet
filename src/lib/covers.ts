/** Preset trip cover images (emoji + colour) — no asset files needed. */
export const COVER_PRESETS: { id: string; emoji: string; color: string }[] = [
  { id: 'signpost', emoji: '🪧', color: '#2E5BFF' },
  { id: 'mountain', emoji: '🏔️', color: '#7A5CCB' },
  { id: 'beach', emoji: '🏖️', color: '#F2A93B' },
  { id: 'city', emoji: '🌆', color: '#E5484D' },
  { id: 'plane', emoji: '✈️', color: '#1FA37A' },
  { id: 'luggage', emoji: '🧳', color: '#D6489B' },
];

export const coverOf = (id?: string) => COVER_PRESETS.find((c) => c.id === id) ?? COVER_PRESETS[0];
