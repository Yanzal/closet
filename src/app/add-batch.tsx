import { Image } from 'expo-image';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { TopBar } from '@/components/top-bar';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Ionicons } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/icon-button';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { Txt } from '@/components/ui/text';
import { palette, Radius, Spacing } from '@/constants/theme';
import { beautifyToFlatImage } from '@/lib/ai/native';
import { classifyGarment } from '@/lib/ai/classify';
import { CATEGORIES, COLOR_OPTIONS, categoryMeta, colorHex, SEASONS } from '@/lib/categories';
import { uid } from '@/lib/id';
import type { Category, Season } from '@/lib/types';
import { useCloset } from '@/store/closet';

type Stage = 'capture' | 'processing' | 'results';
type Phase = 'bg' | 'tag' | 'ready';

interface BatchItem {
  key: string;
  original: string;
  beautified: string;
  useBeautified: boolean;
  selected: boolean;
  expanded: boolean;
  name: string;
  category: Category;
  colors: string[];
  seasons: Season[];
}

/** Resize + compress to a small JPEG data URL (no beautify yet — that happens in processing). */
async function resizeToDataUrl(uri: string, base64?: string | null): Promise<string> {
  try {
    const out = await manipulateAsync(uri, [{ resize: { width: 1000 } }], {
      compress: 0.6,
      format: SaveFormat.JPEG,
      base64: true,
    });
    return out.base64 ? `data:image/jpeg;base64,${out.base64}` : out.uri;
  } catch {
    return base64 ? `data:image/jpeg;base64,${base64}` : uri;
  }
}

const PHASE_LABEL: Record<Phase, string> = {
  bg: 'Removing background… ✂️',
  tag: 'Identifying category… 🏷️',
  ready: 'Getting your analysis ready…',
};

export default function AddBatchScreen() {
  const router = useRouter();
  const addItem = useCloset((s) => s.addItem);

  const [stage, setStage] = useState<Stage>('capture');
  const [shots, setShots] = useState<string[]>([]);
  const [busyPick, setBusyPick] = useState(false);

  // processing
  const [phase, setPhase] = useState<Phase>('bg');
  const [done, setDone] = useState(0);

  // results
  const [items, setItems] = useState<BatchItem[]>([]);
  const startedRef = useRef(false);

  const addShots = async (useCamera: boolean) => {
    try {
      if (useCamera) {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('Camera access needed', 'Enable camera access to take a photo.');
          return;
        }
      }
      const res = useCamera
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.9, base64: true })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsMultipleSelection: true,
            selectionLimit: 0,
            quality: 0.9,
            base64: true,
          });
      if (res.canceled || !res.assets?.length) return;
      setBusyPick(true);
      const next = await Promise.all(res.assets.map((a) => resizeToDataUrl(a.uri, a.base64)));
      setShots((p) => [...p, ...next]);
    } catch (e) {
      Alert.alert('Could not load images', String(e));
    } finally {
      setBusyPick(false);
    }
  };

  const removeShot = (i: number) => setShots((p) => p.filter((_, idx) => idx !== i));

  // Run the staged pipeline once we enter the processing stage.
  useEffect(() => {
    if (stage !== 'processing' || startedRef.current) return;
    startedRef.current = true;
    (async () => {
      // Pass 1 — background removal.
      setPhase('bg');
      setDone(0);
      const beautified: string[] = [];
      for (let i = 0; i < shots.length; i++) {
        beautified.push(await beautifyToFlatImage(shots[i]));
        setDone(i + 1);
      }
      // Pass 2 — auto-tagging.
      setPhase('tag');
      setDone(0);
      const built: BatchItem[] = [];
      for (let i = 0; i < shots.length; i++) {
        const tags = await classifyGarment(beautified[i]);
        built.push({
          key: uid('bi_'),
          original: shots[i],
          beautified: beautified[i],
          useBeautified: true,
          selected: true,
          expanded: false,
          name: tags.name,
          category: tags.category,
          colors: tags.colors,
          seasons: tags.seasons,
        });
        setDone(i + 1);
      }
      setPhase('ready');
      setItems(built);
      await new Promise((r) => setTimeout(r, 600));
      setStage('results');
    })();
  }, [stage, shots]);

  const patch = (key: string, p: Partial<BatchItem>) =>
    setItems((list) => list.map((it) => (it.key === key ? { ...it, ...p } : it)));

  const toggleIn = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const selectedCount = items.filter((it) => it.selected).length;
  const allSelected = items.length > 0 && selectedCount === items.length;

  const addToCloset = () => {
    const chosen = items.filter((it) => it.selected);
    if (!chosen.length) return;
    for (const it of chosen) {
      const finalName = it.name.trim() || (it.colors[0] ? `${it.colors[0]} ${it.category}` : it.category);
      addItem({
        name: finalName,
        photoUri: it.useBeautified ? it.beautified : it.original,
        category: it.category,
        colors: it.colors,
        seasons: it.seasons,
      });
    }
    router.replace('/wardrobe');
  };

  // ---- CAPTURE ----------------------------------------------------------------
  if (stage === 'capture') {
    const header = (
      <TopBar
        left={
          <IconButton onPress={() => router.back()} style={{ marginLeft: -8 }}>
            <Ionicons name="close" size={26} color={palette.ink} />
          </IconButton>
        }
        right={
          <Button
            title={shots.length ? `Process ${shots.length}` : 'Process'}
            compact
            full={false}
            disabled={!shots.length || busyPick}
            onPress={() => setStage('processing')}
          />
        }
      />
    );
    return (
      <Screen header={header} bottomInset={false}>
        <Stack.Screen options={{ presentation: 'modal', headerShown: false, animation: 'slide_from_bottom' }} />
        <Txt variant="h2">Add multiple items</Txt>
        <Txt variant="small" color="textMuted" style={{ marginTop: 4 }}>
          Pick a batch of photos — we&apos;ll remove the backgrounds and tag them all at once.
        </Txt>

        <View style={styles.pickRow}>
          <Button
            title="Choose photos"
            full={false}
            leftIcon={<Ionicons name="images-outline" size={18} color="#fff" />}
            onPress={() => addShots(false)}
            disabled={busyPick}
            style={{ flex: 1 }}
          />
          <Button
            title="Camera"
            variant="secondary"
            full={false}
            leftIcon={<Ionicons name="camera-outline" size={18} color={palette.ink} />}
            onPress={() => addShots(true)}
            disabled={busyPick}
            style={{ flex: 1 }}
          />
        </View>

        {busyPick ? <ActivityIndicator color={palette.ink} style={{ marginTop: Spacing.lg }} /> : null}

        {shots.length ? (
          <View style={styles.grid}>
            {shots.map((s, i) => (
              <View key={i} style={styles.gridCell}>
                <Image source={{ uri: s }} style={styles.gridImg} contentFit="cover" />
                <Pressable style={styles.removeBadge} onPress={() => removeShot(i)} hitSlop={8}>
                  <Ionicons name="close" size={14} color="#fff" />
                </Pressable>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyHint}>
            <Ionicons name="duplicate-outline" size={34} color={palette.gray} />
            <Txt variant="small" color="textMuted">No photos yet — add a few to get started.</Txt>
          </View>
        )}
      </Screen>
    );
  }

  // ---- PROCESSING -------------------------------------------------------------
  if (stage === 'processing') {
    return (
      <Screen header={<TopBar />} bottomInset={false}>
        <Stack.Screen options={{ headerShown: false }} />
        <Txt variant="title" style={{ marginTop: Spacing.sm }}>{PHASE_LABEL[phase]}</Txt>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${shots.length ? Math.round((done / shots.length) * 100) : 0}%` },
            ]}
          />
        </View>
        <View style={{ marginTop: Spacing.lg, gap: Spacing.md }}>
          {shots.map((s, i) => (
            <View key={i} style={styles.procRow}>
              <Image source={{ uri: s }} style={styles.procThumb} contentFit="cover" />
              <View style={{ flex: 1, gap: 8 }}>
                <View style={[styles.skeleton, { width: '70%' }]} />
                <View style={[styles.skeleton, { width: '45%' }]} />
              </View>
              {phase === 'tag' && i < done ? (
                <Ionicons name="checkmark-circle" size={20} color={palette.blue} />
              ) : i < done || phase !== 'bg' ? (
                <Ionicons name="checkmark-circle" size={20} color={palette.mint} />
              ) : (
                <ActivityIndicator color={palette.gray} />
              )}
            </View>
          ))}
        </View>
      </Screen>
    );
  }

  // ---- RESULTS ----------------------------------------------------------------
  const header = (
    <TopBar
      left={<BackTitleInline title="Review items" onBack={() => setStage('capture')} />}
      right={
        <Pressable
          onPress={() => setItems((l) => l.map((it) => ({ ...it, selected: !allSelected })))}
          hitSlop={8}
        >
          <Txt variant="small" color="accent">{allSelected ? 'Deselect all' : 'Select all'}</Txt>
        </Pressable>
      }
    />
  );

  return (
    <Screen header={header} scroll={false} bottomInset={false}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <Txt variant="small" color="textMuted" style={{ marginBottom: Spacing.sm }}>
          {selectedCount} of {items.length} selected · tap a row to edit, tap the photo to compare beautified vs original.
        </Txt>

        {items.map((it) => {
          const meta = categoryMeta(it.category);
          return (
            <View key={it.key} style={styles.resultCard}>
              <View style={styles.resultTop}>
                <Pressable onPress={() => patch(it.key, { selected: !it.selected })} hitSlop={6}>
                  <Ionicons
                    name={it.selected ? 'checkbox' : 'square-outline'}
                    size={24}
                    color={it.selected ? palette.ink : palette.gray}
                  />
                </Pressable>

                <Pressable onPress={() => patch(it.key, { useBeautified: !it.useBeautified })}>
                  <Image
                    source={{ uri: it.useBeautified ? it.beautified : it.original }}
                    style={styles.resultThumb}
                    contentFit="cover"
                  />
                  <View style={styles.beautyTag}>
                    <Txt variant="caption" color="onPrimary">
                      {it.useBeautified ? 'Beautified' : 'Original'}
                    </Txt>
                  </View>
                </Pressable>

                <Pressable style={{ flex: 1 }} onPress={() => patch(it.key, { expanded: !it.expanded })}>
                  <View style={[styles.catBadge, { backgroundColor: meta.tint }]}>
                    <Txt variant="caption" color="text">{meta.emoji} {it.category}</Txt>
                  </View>
                  <Txt variant="body" numberOfLines={1} style={{ marginTop: 4 }}>
                    {it.name.trim() || 'Untitled item'}
                  </Txt>
                  <Txt variant="caption" color="textMuted" numberOfLines={1}>
                    {[it.colors.join(', '), it.seasons.join(', ')].filter(Boolean).join(' · ') || 'Tap to add details'}
                  </Txt>
                </Pressable>

                <Ionicons name={it.expanded ? 'chevron-up' : 'chevron-down'} size={18} color={palette.gray} />
              </View>

              {it.expanded ? (
                <View style={styles.editor}>
                  <Field label="Name">
                    <Input
                      placeholder="e.g. Beige coach jacket"
                      value={it.name}
                      onChangeText={(t) => patch(it.key, { name: t })}
                    />
                  </Field>
                  <Field label="Category">
                    <View style={styles.wrap}>
                      {CATEGORIES.map((c) => (
                        <Chip
                          key={c.key}
                          label={c.label}
                          selected={it.category === c.key}
                          onPress={() => patch(it.key, { category: c.key })}
                        />
                      ))}
                    </View>
                  </Field>
                  <Field label="Colors">
                    <View style={styles.wrap}>
                      {COLOR_OPTIONS.map((c) => (
                        <Chip
                          key={c.name}
                          label={c.name}
                          selected={it.colors.includes(c.name)}
                          onPress={() => patch(it.key, { colors: toggleIn(it.colors, c.name) })}
                          leading={<View style={[styles.swatch, { backgroundColor: colorHex(c.name) }]} />}
                        />
                      ))}
                    </View>
                  </Field>
                  <Field label="Season">
                    <View style={styles.wrap}>
                      {SEASONS.map((s) => (
                        <Chip
                          key={s}
                          label={s}
                          selected={it.seasons.includes(s)}
                          onPress={() => patch(it.key, { seasons: toggleIn(it.seasons, s) })}
                        />
                      ))}
                    </View>
                  </Field>
                  <Pressable
                    onPress={() => setItems((l) => l.filter((x) => x.key !== it.key))}
                    style={styles.deleteRow}
                  >
                    <Ionicons name="trash-outline" size={16} color={palette.danger} />
                    <Txt variant="small" style={{ color: palette.danger }}>Remove from batch</Txt>
                  </Pressable>
                </View>
              ) : null}
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={`Add ${selectedCount} to closet`}
          disabled={selectedCount === 0}
          onPress={addToCloset}
        />
      </View>
    </Screen>
  );
}

function BackTitleInline({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <Pressable onPress={onBack} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginLeft: -6 }}>
      <Ionicons name="chevron-back" size={24} color={palette.ink} />
      <Txt variant="title">{title}</Txt>
    </Pressable>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 8, marginTop: Spacing.md }}>
      <Txt variant="label" color="textSecondary">{label}</Txt>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  pickRow: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.lg },
  gridCell: { width: '31%', aspectRatio: 1, borderRadius: Radius.lg, overflow: 'hidden', backgroundColor: palette.cloud },
  gridImg: { width: '100%', height: '100%' },
  removeBadge: {
    position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: 11,
    backgroundColor: 'rgba(18,19,22,0.78)', alignItems: 'center', justifyContent: 'center',
  },
  emptyHint: { alignItems: 'center', gap: 10, paddingVertical: Spacing.xxl, marginTop: Spacing.lg },

  progressTrack: { height: 6, borderRadius: 3, backgroundColor: palette.cloud, overflow: 'hidden', marginTop: Spacing.md },
  progressFill: { height: '100%', backgroundColor: palette.blue, borderRadius: 3 },
  procRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  procThumb: { width: 56, height: 56, borderRadius: Radius.md, backgroundColor: palette.cloud },
  skeleton: { height: 12, borderRadius: 6, backgroundColor: palette.cloud },

  resultCard: { borderWidth: 1, borderColor: palette.hairline, borderRadius: Radius.xl, padding: Spacing.md, marginBottom: Spacing.md },
  resultTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  resultThumb: { width: 64, height: 64, borderRadius: Radius.md, backgroundColor: palette.cloud },
  beautyTag: {
    position: 'absolute', bottom: 4, left: 4, backgroundColor: 'rgba(18,19,22,0.72)',
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.pill,
  },
  catBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.pill },
  editor: { marginTop: Spacing.md, borderTopWidth: 1, borderTopColor: palette.hairline, paddingTop: Spacing.sm },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  swatch: { width: 12, height: 12, borderRadius: 6, borderWidth: 1, borderColor: palette.hairline },
  deleteRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Spacing.lg, paddingVertical: 6 },
  footer: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    padding: Spacing.lg, paddingBottom: Spacing.xl,
    backgroundColor: palette.white, borderTopWidth: 1, borderTopColor: palette.hairline,
  },
});
