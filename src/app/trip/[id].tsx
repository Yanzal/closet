import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ItemTile } from '@/components/item-tile';
import { OutfitPreview } from '@/components/outfit/outfit-preview';
import { BackTitle } from '@/components/sub-header';
import { TopBar } from '@/components/top-bar';
import { Button } from '@/components/ui/button';
import { Grid } from '@/components/ui/grid';
import { Ionicons } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/icon-button';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { Txt } from '@/components/ui/text';
import { UnderlineTabs } from '@/components/ui/underline-tabs';
import { palette, Radius, Spacing } from '@/constants/theme';
import { coverOf } from '@/lib/covers';
import { eachDayKey, fmtDayShort, fmtRange } from '@/lib/date';
import { uid } from '@/lib/id';
import { DayWeather, geocodeCity, getDailyForecast, weatherInfo } from '@/lib/weather';
import { useCloset } from '@/store/closet';

type Tab = 'Outfit' | 'Item' | 'Checklist';

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const trip = useCloset((s) => s.trips.find((t) => t.id === id));
  const outfits = useCloset((s) => s.outfits);
  const items = useCloset((s) => s.items);
  const updateTrip = useCloset((s) => s.updateTrip);
  const removeTrip = useCloset((s) => s.removeTrip);

  const [tab, setTab] = useState<Tab>('Outfit');
  const [weather, setWeather] = useState<Record<string, DayWeather>>({});
  const [wLoading, setWLoading] = useState(false);
  const [addDay, setAddDay] = useState<string | null>(null);
  const [newTask, setNewTask] = useState('');

  const city = trip?.city;
  const startDate = trip?.startDate;
  const endDate = trip?.endDate;

  useEffect(() => {
    if (!city || !startDate || !endDate) return;
    let cancelled = false;
    (async () => {
      setWLoading(true);
      const geo = await geocodeCity(city);
      if (!geo) {
        if (!cancelled) {
          setWeather({});
          setWLoading(false);
        }
        return;
      }
      const days = await getDailyForecast(geo.latitude, geo.longitude, startDate, endDate);
      if (!cancelled) {
        setWeather(Object.fromEntries(days.map((d) => [d.date, d])));
        setWLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [city, startDate, endDate]);

  if (!trip) {
    return (
      <Screen header={<TopBar left={<BackTitle title="Trip" onBack={() => router.back()} />} />}>
        <Txt color="textSecondary">This trip was not found.</Txt>
      </Screen>
    );
  }

  const days = eachDayKey(trip.startDate, trip.endDate);
  const dayOutfits = trip.dayOutfits ?? {};
  const checklist = trip.checklist ?? [];

  const allOutfitIds = [...new Set(Object.values(dayOutfits).flat())];
  const tripItems = [
    ...new Set(allOutfitIds.flatMap((oid) => outfits.find((o) => o.id === oid)?.itemIds ?? [])),
  ]
    .map((iid) => items.find((i) => i.id === iid))
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  const addOutfitToDay = (day: string, oid: string) => {
    const next = { ...dayOutfits, [day]: [...(dayOutfits[day] ?? []), oid] };
    updateTrip(trip.id, { dayOutfits: next });
  };
  const removeOutfitFromDay = (day: string, idx: number) => {
    const next = { ...dayOutfits, [day]: (dayOutfits[day] ?? []).filter((_, i) => i !== idx) };
    updateTrip(trip.id, { dayOutfits: next });
  };
  const addTask = () => {
    if (!newTask.trim()) return;
    updateTrip(trip.id, { checklist: [...checklist, { id: uid('ck_'), label: newTask.trim(), done: false }] });
    setNewTask('');
  };
  const toggleTask = (tid: string) =>
    updateTrip(trip.id, { checklist: checklist.map((c) => (c.id === tid ? { ...c, done: !c.done } : c)) });
  const removeTask = (tid: string) =>
    updateTrip(trip.id, { checklist: checklist.filter((c) => c.id !== tid) });

  const onDelete = () =>
    Alert.alert('Delete trip', `Remove “${trip.title}”?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { removeTrip(trip.id); router.back(); } },
    ]);

  const header = (
    <TopBar
      left={<BackTitle title="" onBack={() => router.back()} />}
      right={
        <IconButton onPress={onDelete}>
          <Ionicons name="trash-outline" size={22} color={palette.ink} />
        </IconButton>
      }
    />
  );

  return (
    <Screen header={header}>
      <View style={[styles.banner, { backgroundColor: coverOf(trip.heroUri).color }]}>
        <Txt style={{ fontSize: 26 }}>{coverOf(trip.heroUri).emoji}</Txt>
        <Txt variant="h2" color="onPrimary">{trip.title}</Txt>
        <View style={styles.bannerMeta}>
          <Ionicons name="calendar-outline" size={14} color={palette.silver} />
          <Txt variant="small" style={{ color: palette.silver }}>{fmtRange(trip.startDate, trip.endDate)}</Txt>
          <Ionicons name="location-outline" size={14} color={palette.silver} style={{ marginLeft: 8 }} />
          <Txt variant="small" style={{ color: palette.silver }}>{trip.city}</Txt>
        </View>
        {trip.note ? (
          <Txt variant="small" style={{ color: palette.silver }}>{trip.note}</Txt>
        ) : null}
      </View>

      <View style={{ marginVertical: Spacing.lg }}>
        <UnderlineTabs tabs={['Outfit', 'Item', 'Checklist']} value={tab} onChange={setTab} />
      </View>

      {tab === 'Outfit' ? (
        <View style={{ gap: Spacing.md }}>
          {days.map((day, i) => {
            const w = weather[day];
            const assigned = dayOutfits[day] ?? [];
            return (
              <View key={day} style={styles.dayCard}>
                <View style={styles.dayHead}>
                  <View>
                    <Txt variant="bodyStrong">Day {i + 1}</Txt>
                    <Txt variant="small" color="textMuted">{fmtDayShort(day)}</Txt>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    {wLoading ? (
                      <ActivityIndicator size="small" color={palette.gray} />
                    ) : w ? (
                      <Txt variant="small">
                        {weatherInfo(w.code).emoji} {w.tMax}° / {w.tMin}°
                      </Txt>
                    ) : (
                      <Txt variant="small" color="textMuted">—</Txt>
                    )}
                  </View>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayRow}>
                  {assigned.map((oid, idx) => {
                    const o = outfits.find((x) => x.id === oid);
                    if (!o) return null;
                    return (
                      <Pressable
                        key={`${oid}-${idx}`}
                        onLongPress={() => removeOutfitFromDay(day, idx)}
                        onPress={() => router.push({ pathname: '/outfit/[id]', params: { id: oid } })}>
                        <View style={styles.dayThumb}>
                          <OutfitPreview items={items} nodes={o.nodes} size={74} />
                        </View>
                      </Pressable>
                    );
                  })}
                  <Pressable style={styles.addOutfit} onPress={() => setAddDay(day)}>
                    <Ionicons name="add" size={22} color={palette.gray} />
                    <Txt variant="caption" color="textMuted">Add</Txt>
                  </Pressable>
                </ScrollView>
              </View>
            );
          })}
          <Txt variant="caption" color="textMuted" style={{ textAlign: 'center', marginTop: 4 }}>
            Tip: long-press an outfit to remove it from a day.
          </Txt>
        </View>
      ) : tab === 'Item' ? (
        tripItems.length === 0 ? (
          <Txt variant="small" color="textMuted">Assign outfits to days to see everything you&apos;re packing.</Txt>
        ) : (
          <Grid
            numColumns={3}
            gap={10}
            data={tripItems}
            keyExtractor={(it) => it.id}
            renderItem={(it) => (
              <ItemTile item={it} showMeta onPress={() => router.push({ pathname: '/item/[id]', params: { id: it.id } })} />
            )}
          />
        )
      ) : (
        <View>
          <View style={styles.addTaskRow}>
            <Input
              placeholder="Add to packing list…"
              value={newTask}
              onChangeText={setNewTask}
              onSubmitEditing={addTask}
              style={{ flex: 1 }}
            />
            <Button title="Add" compact full={false} onPress={addTask} />
          </View>
          {checklist.length === 0 ? (
            <Txt variant="small" color="textMuted" style={{ marginTop: Spacing.md }}>
              Nothing on your list yet.
            </Txt>
          ) : (
            <View style={{ marginTop: Spacing.md }}>
              {checklist.map((c) => (
                <View key={c.id} style={styles.taskRow}>
                  <Pressable style={styles.taskLeft} onPress={() => toggleTask(c.id)}>
                    <Ionicons
                      name={c.done ? 'checkmark-circle' : 'ellipse-outline'}
                      size={22}
                      color={c.done ? palette.green : palette.silver}
                    />
                    <Txt
                      variant="body"
                      color={c.done ? 'textMuted' : 'text'}
                      style={c.done ? { textDecorationLine: 'line-through' } : undefined}>
                      {c.label}
                    </Txt>
                  </Pressable>
                  <IconButton onPress={() => removeTask(c.id)} size={32}>
                    <Ionicons name="close" size={18} color={palette.gray} />
                  </IconButton>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Add-outfit-to-day picker */}
      <Modal visible={!!addDay} transparent animationType="slide" onRequestClose={() => setAddDay(null)}>
        <Pressable style={styles.backdrop} onPress={() => setAddDay(null)} />
        <View style={styles.sheetWrap} pointerEvents="box-none">
          <View style={styles.sheet}>
            <View style={styles.grabber} />
            <Txt variant="title">{addDay ? `Add to ${fmtDayShort(addDay)}` : ''}</Txt>
            {outfits.length === 0 ? (
              <View style={{ alignItems: 'center', gap: 10, paddingVertical: Spacing.xl }}>
                <Txt variant="small" color="textMuted">Save an outfit first to pack it.</Txt>
                <Button title="Create outfit" full={false} onPress={() => { setAddDay(null); router.push('/outfit/builder'); }} />
              </View>
            ) : (
              <ScrollView style={{ maxHeight: 320 }} contentContainerStyle={styles.pickGrid}>
                {outfits.map((o) => (
                  <Pressable
                    key={o.id}
                    onPress={() => {
                      if (addDay) addOutfitToDay(addDay, o.id);
                      setAddDay(null);
                    }}
                    style={styles.pickItem}>
                    <View style={styles.pickThumb}>
                      <OutfitPreview items={items} nodes={o.nodes} size={92} />
                    </View>
                    <Txt variant="caption" numberOfLines={1}>{o.name}</Txt>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  banner: { backgroundColor: palette.ink, borderRadius: Radius.xl, padding: Spacing.lg, gap: 6 },
  bannerMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  dayCard: { borderWidth: 1, borderColor: palette.hairline, borderRadius: Radius.lg, padding: Spacing.md, gap: Spacing.sm },
  dayHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dayRow: { gap: Spacing.sm, alignItems: 'center', paddingRight: 4 },
  dayThumb: { width: 74, height: 74, borderRadius: Radius.md, overflow: 'hidden', borderWidth: 1, borderColor: palette.hairline },
  addOutfit: {
    width: 74,
    height: 74,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: palette.hairline,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  addTaskRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  taskRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
  taskLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1 },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10,12,20,0.35)' },
  sheetWrap: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  sheet: { width: '100%', maxWidth: 480, backgroundColor: palette.white, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, padding: Spacing.lg, gap: Spacing.sm },
  grabber: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: palette.hairline, marginBottom: 4 },
  pickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, paddingTop: Spacing.sm },
  pickItem: { width: 92, gap: 4 },
  pickThumb: { width: 92, height: 92, borderRadius: Radius.md, overflow: 'hidden', borderWidth: 1, borderColor: palette.hairline },
});
