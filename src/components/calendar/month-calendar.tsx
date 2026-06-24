import { useRouter } from 'expo-router';
import { useState } from 'react';
import { LayoutChangeEvent, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { OutfitPreview } from '@/components/outfit/outfit-preview';
import { PlaceholderThumb } from '@/components/placeholder-thumb';
import { Button } from '@/components/ui/button';
import { Ionicons } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/icon-button';
import { Txt } from '@/components/ui/text';
import { palette, Radius, Spacing } from '@/constants/theme';
import { chunk, fmtDayShort, monthCells, monthLabel, pad, toKey, todayKey, weekdayLabels } from '@/lib/date';

function weekKeysOf(ref: Date, mondayStart: boolean): (string | null)[] {
  const dow = ref.getDay();
  const back = mondayStart ? (dow + 6) % 7 : dow;
  const start = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate() - back);
  return Array.from({ length: 7 }, (_, i) =>
    toKey(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)),
  );
}
import { useCloset } from '@/store/closet';

const GAP = 6;

export function MonthCalendar() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [gw, setGw] = useState(0);
  const [pickDate, setPickDate] = useState<string | null>(null);
  const [view, setView] = useState<'month' | 'week'>('month');
  const [weekRef, setWeekRef] = useState(now);

  const calendar = useCloset((s) => s.calendar);
  const outfits = useCloset((s) => s.outfits);
  const items = useCloset((s) => s.items);
  const mondayStart = useCloset((s) => s.settings.weekStartsMonday);

  const cell = gw > 0 ? (gw - GAP * 6) / 7 : 0;
  const weekdays = weekdayLabels(mondayStart);
  const weeks =
    view === 'week' ? [weekKeysOf(weekRef, mondayStart)] : chunk(monthCells(year, month, mondayStart), 7);
  const label =
    view === 'week'
      ? `Week of ${weekRef.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
      : monthLabel(year, month);
  const monthPrefix = `${year}-${pad(month + 1)}`;

  const entryFor = (key: string) => calendar.find((e) => e.date === key);
  const outfitOf = (id?: string) => outfits.find((o) => o.id === id);

  const shiftWeek = (d: number) =>
    setWeekRef((r) => new Date(r.getFullYear(), r.getMonth(), r.getDate() + d * 7));
  const prev = () => {
    if (view === 'week') return shiftWeek(-1);
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else {
      setMonth((m) => m - 1);
    }
  };
  const next = () => {
    if (view === 'week') return shiftWeek(1);
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const ootd = calendar.filter((e) => e.date.startsWith(monthPrefix)).length;
  const mostWorn = [...items].sort((a, b) => b.wearCount - a.wearCount)[0];
  const closetValue = items.reduce((sum, i) => sum + (i.price || 0), 0);

  return (
    <View>
      <View style={styles.toggleRow}>
        <Pressable onPress={() => setView('month')} hitSlop={8} style={[styles.toggle, view === 'month' ? styles.toggleOn : null]}>
          <Ionicons name="calendar-clear-outline" size={18} color={view === 'month' ? palette.ink : palette.gray} />
        </Pressable>
        <Pressable onPress={() => setView('week')} hitSlop={8} style={[styles.toggle, view === 'week' ? styles.toggleOn : null]}>
          <Ionicons name="reorder-four-outline" size={18} color={view === 'week' ? palette.ink : palette.gray} />
        </Pressable>
      </View>
      <View style={styles.nav}>
        <IconButton onPress={prev}>
          <Ionicons name="chevron-back" size={22} color={palette.ink} />
        </IconButton>
        <Txt variant="title">{label}</Txt>
        <IconButton onPress={next}>
          <Ionicons name="chevron-forward" size={22} color={palette.ink} />
        </IconButton>
      </View>

      <View style={styles.weekRow}>
        {weekdays.map((d) => (
          <Txt key={d} variant="caption" color="textMuted" style={{ width: cell, textAlign: 'center' }}>
            {d}
          </Txt>
        ))}
      </View>

      <View onLayout={(e: LayoutChangeEvent) => setGw(e.nativeEvent.layout.width)}>
        {cell > 0 &&
          weeks.map((wk, wi) => (
            <View key={wi} style={styles.weekRow}>
              {wk.map((key, ci) => {
                if (!key) return <View key={ci} style={{ width: cell }} />;
                const entry = entryFor(key);
                const outfit = outfitOf(entry?.outfitId);
                const firstItem = entry?.itemIds?.length
                  ? items.find((i) => i.id === entry.itemIds[0])
                  : undefined;
                const isToday = key === todayKey();
                const thumb = cell - 8;
                return (
                  <Pressable key={ci} onPress={() => setPickDate(key)} style={{ width: cell, alignItems: 'center', gap: 2 }}>
                    <View style={[styles.dayNum, isToday ? styles.today : null]}>
                      <Txt variant="caption" color={isToday ? 'onPrimary' : 'text'}>
                        {Number(key.split('-')[2])}
                      </Txt>
                    </View>
                    <View style={{ width: thumb, height: thumb }}>
                      {outfit ? (
                        <View style={styles.thumb}>
                          <OutfitPreview items={items} nodes={outfit.nodes} size={thumb} />
                        </View>
                      ) : firstItem ? (
                        <View style={styles.thumb}>
                          {firstItem.photoUri ? null : (
                            <PlaceholderThumb category={firstItem.category} radius={6} glyphSize={thumb * 0.4} style={styles.fill} />
                          )}
                        </View>
                      ) : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ))}
      </View>

      <View style={styles.stats}>
        <StatCard label="OOTD" value={`${ootd}`} />
        <StatCard
          label="Most worn"
          node={
            mostWorn ? (
              <View style={styles.statThumb}>
                <PlaceholderThumb category={mostWorn.category} radius={8} glyphSize={20} style={styles.fill} />
              </View>
            ) : (
              <Txt variant="h2" color="accent">—</Txt>
            )
          }
        />
        <StatCard label="Closet value" value={`$${closetValue}`} />
      </View>

      <DayPicker date={pickDate} onClose={() => setPickDate(null)} />
    </View>
  );
}

function StatCard({ label, value, node }: { label: string; value?: string; node?: React.ReactNode }) {
  return (
    <View style={styles.statCard}>
      <Txt variant="caption" color="textMuted">{label}</Txt>
      {node ?? (
        <Txt variant="h2" color="accent">
          {value}
        </Txt>
      )}
    </View>
  );
}

function DayPicker({ date, onClose }: { date: string | null; onClose: () => void }) {
  const router = useRouter();
  const outfits = useCloset((s) => s.outfits);
  const items = useCloset((s) => s.items);
  const calendar = useCloset((s) => s.calendar);
  const setCalendarEntry = useCloset((s) => s.setCalendarEntry);
  const removeCalendarEntry = useCloset((s) => s.removeCalendarEntry);

  const entry = date ? calendar.find((e) => e.date === date) : undefined;

  return (
    <Modal visible={!!date} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheetWrap} pointerEvents="box-none">
        <View style={styles.sheet}>
          <View style={styles.grabber} />
          <Txt variant="title">{date ? fmtDayShort(date) : ''}</Txt>

          {outfits.length === 0 ? (
            <View style={{ alignItems: 'center', gap: 10, paddingVertical: Spacing.xl }}>
              <Txt variant="small" color="textMuted">Save an outfit first, then plan it here.</Txt>
              <Button
                title="Create outfit"
                full={false}
                onPress={() => {
                  onClose();
                  router.push('/outfit/builder');
                }}
              />
            </View>
          ) : (
            <ScrollView style={{ maxHeight: 320 }} contentContainerStyle={styles.pickGrid}>
              {outfits.map((o) => {
                const active = entry?.outfitId === o.id;
                return (
                  <Pressable
                    key={o.id}
                    onPress={() => {
                      if (date) setCalendarEntry(date, { outfitId: o.id });
                      onClose();
                    }}
                    style={[styles.pickItem, active ? styles.pickActive : null]}>
                    <View style={styles.pickThumb}>
                      <OutfitPreview items={items} nodes={o.nodes} size={92} />
                    </View>
                    <Txt variant="caption" numberOfLines={1}>{o.name}</Txt>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}

          {entry ? (
            <Button
              title="Remove look"
              variant="ghost"
              onPress={() => {
                if (date) removeCalendarEntry(date);
                onClose();
              }}
              style={{ marginTop: Spacing.md }}
            />
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  toggleRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 6, marginBottom: 4 },
  toggle: { padding: 6, borderRadius: 8 },
  toggleOn: { backgroundColor: palette.cloud },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm },
  weekRow: { flexDirection: 'row', gap: GAP, marginBottom: GAP },
  dayNum: { minWidth: 22, height: 20, paddingHorizontal: 6, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  today: { backgroundColor: palette.black },
  thumb: { width: '100%', height: '100%', borderRadius: 6, overflow: 'hidden', backgroundColor: palette.cloud },
  fill: { width: '100%', height: '100%' },
  stats: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.lg },
  statCard: {
    flex: 1,
    backgroundColor: palette.cloud,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    gap: 6,
    minHeight: 78,
    justifyContent: 'center',
  },
  statThumb: { width: 34, height: 34, borderRadius: 8, overflow: 'hidden' },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10,12,20,0.35)' },
  sheetWrap: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  sheet: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: palette.white,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  grabber: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: palette.hairline, marginBottom: 4 },
  pickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, paddingTop: Spacing.sm },
  pickItem: { width: 92, gap: 4 },
  pickThumb: { width: 92, height: 92, borderRadius: Radius.md, overflow: 'hidden', borderWidth: 1, borderColor: palette.hairline },
  pickActive: { opacity: 0.6 },
});
