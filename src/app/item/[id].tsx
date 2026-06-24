import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AttributeRow } from '@/components/attribute-row';
import { EditSheet, type EditConfig } from '@/components/edit-sheet';
import { PlaceholderThumb } from '@/components/placeholder-thumb';
import { BackTitle } from '@/components/sub-header';
import { TopBar } from '@/components/top-bar';
import { Button } from '@/components/ui/button';
import { Ionicons } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/icon-button';
import { Screen } from '@/components/ui/screen';
import { Txt } from '@/components/ui/text';
import { palette, Radius, Spacing } from '@/constants/theme';
import { FITS, MATERIALS, OCCASIONS, PATTERNS, STYLES } from '@/lib/attributes';
import { CATEGORY_KEYS, COLOR_OPTIONS, SEASONS } from '@/lib/categories';
import type { ClothingItem } from '@/lib/types';
import { useCloset } from '@/store/closet';

type Field = keyof ClothingItem;

export default function ItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const item = useCloset((s) => s.items.find((i) => i.id === id));
  const outfits = useCloset((s) => s.outfits);
  const items = useCloset((s) => s.items);
  const updateItem = useCloset((s) => s.updateItem);
  const removeItem = useCloset((s) => s.removeItem);

  const [tab, setTab] = useState<'Info' | 'Outfit'>('Info');
  const [edit, setEdit] = useState<{ field: Field; config: EditConfig } | null>(null);

  if (!item) {
    return (
      <Screen header={<TopBar left={<BackTitle title="Item" onBack={() => router.back()} />} />}>
        <Txt color="textSecondary">This item was not found.</Txt>
      </Screen>
    );
  }

  const openChips = (field: Field, title: string, options: string[], multi: boolean, value: string[], colorDots = false) =>
    setEdit({ field, config: { kind: 'chips', title, options, multi, value, colorDots } });
  const openText = (field: Field, title: string, value: string, opts?: { numeric?: boolean; placeholder?: string }) =>
    setEdit({ field, config: { kind: 'text', title, value, numeric: opts?.numeric, placeholder: opts?.placeholder } });

  const onSave = (v: string[] | string) => {
    if (!edit) return;
    const f = edit.field;
    let patch: Partial<ClothingItem> = {};
    if (f === 'price') patch.price = v ? Number(v) || undefined : undefined;
    else if (f === 'labels') patch.labels = (v as string).split(',').map((s) => s.trim()).filter(Boolean);
    else (patch as Record<string, unknown>)[f] = v;
    updateItem(item.id, patch);
  };

  const setRating = (n: number) => updateItem(item.id, { rating: n });
  const bumpWear = (d: number) =>
    updateItem(item.id, { wearCount: Math.max(0, item.wearCount + d) });

  const onMenu = () =>
    Alert.alert(item.name, undefined, [
      {
        text: item.archived ? 'Unarchive' : 'Archive',
        onPress: () => updateItem(item.id, { archived: !item.archived }),
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          removeItem(item.id);
          router.back();
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);

  const cpw = item.price && item.wearCount > 0 ? (item.price / item.wearCount).toFixed(2) : '0.00';
  const outfitsWith = outfits.filter((o) => o.itemIds.includes(item.id));
  const looks = looksWith(item, items);

  const header = (
    <TopBar
      left={<BackTitle title="Item Details" onBack={() => router.back()} />}
      right={
        <IconButton onPress={onMenu}>
          <Ionicons name="ellipsis-horizontal" size={22} color={palette.ink} />
        </IconButton>
      }
    />
  );

  return (
    <Screen header={header}>
      {/* Photo + actions */}
      <View style={styles.hero}>
        {item.photoUri ? (
          <Image source={{ uri: item.photoUri }} style={styles.heroImg} contentFit="cover" />
        ) : (
          <PlaceholderThumb category={item.category} glyphSize={76} radius={Radius.xl} style={styles.heroImg} />
        )}
        <View style={styles.heroBtns}>
          <Pressable style={[styles.pill, { backgroundColor: palette.cloud }]} onPress={() => router.push('/add')}>
            <Ionicons name="pencil" size={14} color={palette.ink} />
            <Txt variant="caption">Edit</Txt>
          </Pressable>
          <Pressable
            style={[styles.pill, { backgroundColor: palette.blue }]}
            onPress={() => router.push({ pathname: '/stylist/[feature]', params: { feature: 'beautify' } })}>
            <Ionicons name="sparkles" size={14} color="#fff" />
            <Txt variant="caption" color="onPrimary">Beautify</Txt>
          </Pressable>
        </View>
      </View>

      <Txt variant="h2" style={{ marginTop: Spacing.md }}>
        {item.name}
      </Txt>
      <Txt variant="small" color="textMuted">{item.brand || 'No brand'}</Txt>

      {/* Segmented tabs */}
      <View style={styles.seg}>
        {(['Info', 'Outfit'] as const).map((t) => (
          <Pressable key={t} style={[styles.segBtn, tab === t ? styles.segOn : null]} onPress={() => setTab(t)}>
            <Txt variant="bodyStrong" color={tab === t ? 'text' : 'textMuted'}>{t}</Txt>
          </Pressable>
        ))}
      </View>

      {tab === 'Info' ? (
        <View>
          {/* Rating */}
          <View style={styles.ratingRow}>
            <Txt variant="small" color="textMuted">My Rating</Txt>
            <View style={{ flexDirection: 'row', gap: 4 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Pressable key={n} onPress={() => setRating(n)} hitSlop={4}>
                  <Ionicons
                    name={(item.rating ?? 0) >= n ? 'star' : 'star-outline'}
                    size={22}
                    color={(item.rating ?? 0) >= n ? palette.amber : palette.silver}
                  />
                </Pressable>
              ))}
            </View>
          </View>

          <AttributeRow label="Season" value={item.seasons.join(', ')} onPress={() => openChips('seasons', 'Season', SEASONS as unknown as string[], true, item.seasons)} />
          <AttributeRow label="Occasion" value={item.occasions?.join(', ')} onPress={() => openChips('occasions', 'Occasion', OCCASIONS, true, item.occasions ?? [])} />
          <AttributeRow label="Category" value={item.category} onPress={() => openChips('category', 'Category', CATEGORY_KEYS as unknown as string[], false, [item.category])} />
          <AttributeRow label="Color" value={item.colors.join(', ')} required onPress={() => openChips('colors', 'Color', COLOR_OPTIONS.map((c) => c.name), true, item.colors, true)} />
          <AttributeRow label="Brand" value={item.brand} onPress={() => openText('brand', 'Brand', item.brand ?? '', { placeholder: 'e.g. Uniqlo' })} />
          <AttributeRow label="Material" value={item.material?.join(', ')} onPress={() => openChips('material', 'Material', MATERIALS, true, item.material ?? [])} />
          <AttributeRow label="Pattern" value={item.pattern} onPress={() => openChips('pattern', 'Pattern', PATTERNS, false, item.pattern ? [item.pattern] : [])} />
          <AttributeRow label="Fit" value={item.fit} onPress={() => openChips('fit', 'Fit', FITS, false, item.fit ? [item.fit] : [])} />
          <AttributeRow label="Style" value={item.style} onPress={() => openChips('style', 'Style', STYLES, false, item.style ? [item.style] : [])} />
          <AttributeRow label="Price" value={item.price ? `$${item.price}` : undefined} placeholder="$0.00" onPress={() => openText('price', 'Price', item.price ? String(item.price) : '', { numeric: true, placeholder: '0' })} />
          <AttributeRow label="Labels" value={item.labels?.join(', ')} onPress={() => openText('labels', 'Labels (comma separated)', item.labels?.join(', ') ?? '', { placeholder: 'e.g. favourite, summer' })} />
          <AttributeRow label="Notes" value={item.notes} onPress={() => openText('notes', 'Notes', item.notes ?? '', { placeholder: 'Anything to remember…' })} />

          {/* Wear / cost cards */}
          <View style={styles.cards}>
            <View style={styles.statCard}>
              <Txt variant="caption" color="textMuted">Price</Txt>
              <Txt variant="bodyStrong">${item.price ?? 0}</Txt>
            </View>
            <View style={styles.statCard}>
              <Txt variant="caption" color="textMuted">Wears</Txt>
              <View style={styles.wearRow}>
                <Pressable onPress={() => bumpWear(-1)} hitSlop={6}><Ionicons name="remove-circle-outline" size={22} color={palette.ink} /></Pressable>
                <Txt variant="bodyStrong">{item.wearCount}</Txt>
                <Pressable onPress={() => bumpWear(1)} hitSlop={6}><Ionicons name="add-circle-outline" size={22} color={palette.ink} /></Pressable>
              </View>
            </View>
            <View style={styles.statCard}>
              <Txt variant="caption" color="textMuted">Cost / wear</Txt>
              <Txt variant="bodyStrong">${cpw}</Txt>
            </View>
          </View>
        </View>
      ) : (
        <View>
          <Txt variant="title" style={{ marginTop: Spacing.sm, marginBottom: Spacing.sm }}>Try this outfit</Txt>
          {looks.length === 0 ? (
            <Txt variant="small" color="textMuted">Add more items to see outfit ideas with this piece.</Txt>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.md }}>
              {looks.map((look, i) => (
                <View key={i} style={styles.lookCard}>
                  {look.map((it) => (
                    <View key={it.id} style={styles.lookThumb}>
                      {it.photoUri ? (
                        <Image source={{ uri: it.photoUri }} style={styles.fill} contentFit="cover" />
                      ) : (
                        <PlaceholderThumb category={it.category} radius={8} glyphSize={20} style={styles.fill} />
                      )}
                    </View>
                  ))}
                </View>
              ))}
            </ScrollView>
          )}

          <Txt variant="title" style={{ marginTop: Spacing.xl, marginBottom: Spacing.sm }}>Outfits with this item</Txt>
          {outfitsWith.length === 0 ? (
            <Txt variant="small" color="textMuted">No saved outfits use this item yet.</Txt>
          ) : (
            <View style={styles.savedRow}>
              {outfitsWith.map((o) => (
                <Pressable key={o.id} onPress={() => router.push({ pathname: '/outfit/[id]', params: { id: o.id } })}>
                  <View style={styles.savedThumb}>
                    {o.itemIds.slice(0, 4).map((iid) => {
                      const it = items.find((x) => x.id === iid);
                      if (!it) return null;
                      return (
                        <View key={iid} style={styles.savedCell}>
                          {it.photoUri ? (
                            <Image source={{ uri: it.photoUri }} style={styles.fill} contentFit="cover" />
                          ) : (
                            <PlaceholderThumb category={it.category} radius={0} glyphSize={14} style={styles.fill} />
                          )}
                        </View>
                      );
                    })}
                  </View>
                  <Txt variant="caption" numberOfLines={1} style={{ width: 100 }}>{o.name}</Txt>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      )}

      <Button
        title="Log a wear today"
        onPress={() => bumpWear(1)}
        style={{ marginTop: Spacing.xl }}
      />

      <EditSheet config={edit?.config ?? null} onClose={() => setEdit(null)} onSave={onSave} />
    </Screen>
  );
}

function looksWith(item: ClothingItem, all: ClothingItem[]): ClothingItem[][] {
  const others = all.filter((i) => i.id !== item.id && !i.wishlist && !i.archived);
  const byCat = (c: ClothingItem['category']) => others.filter((i) => i.category === c);
  const want: ClothingItem['category'][] =
    item.category === 'Tops'
      ? ['Bottoms', 'Outerwear', 'Shoes', 'Bags']
      : item.category === 'Bottoms'
        ? ['Tops', 'Outerwear', 'Shoes', 'Bags']
        : ['Tops', 'Bottoms', 'Shoes', 'Bags'];
  const looks: ClothingItem[][] = [];
  for (let k = 0; k < 2; k++) {
    const picks = [item, ...want.map((c) => byCat(c)[k]).filter(Boolean)] as ClothingItem[];
    if (picks.length >= 2) looks.push(picks.slice(0, 4));
  }
  return looks;
}

const styles = StyleSheet.create({
  hero: { aspectRatio: 1, borderRadius: Radius.xl, overflow: 'hidden', backgroundColor: palette.cloud },
  heroImg: { width: '100%', height: '100%' },
  heroBtns: { position: 'absolute', right: 10, bottom: 10, flexDirection: 'row', gap: 8 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.pill },
  seg: { flexDirection: 'row', backgroundColor: palette.cloud, borderRadius: Radius.md, padding: 4, marginTop: Spacing.lg },
  segBtn: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: Radius.sm },
  segOn: { backgroundColor: palette.white },
  ratingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: palette.hairline },
  cards: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.lg },
  statCard: { flex: 1, backgroundColor: palette.cloud, borderRadius: Radius.lg, paddingVertical: Spacing.md, alignItems: 'center', gap: 6 },
  wearRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  lookCard: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, width: 150, padding: 10, borderRadius: Radius.lg, borderWidth: 1, borderColor: palette.hairline },
  lookThumb: { width: 60, height: 60, borderRadius: 8, overflow: 'hidden', backgroundColor: palette.cloud },
  savedRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  savedThumb: { width: 100, height: 100, borderRadius: Radius.md, overflow: 'hidden', flexDirection: 'row', flexWrap: 'wrap', backgroundColor: palette.cloud },
  savedCell: { width: '50%', height: '50%' },
  fill: { width: '100%', height: '100%' },
});
