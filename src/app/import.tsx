import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { BackTitle } from '@/components/sub-header';
import { TopBar } from '@/components/top-bar';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Ionicons } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { Txt } from '@/components/ui/text';
import { palette, Radius, Spacing } from '@/constants/theme';
import { CATEGORIES, categoryMeta } from '@/lib/categories';
import { importFromUrl } from '@/lib/import-url';
import { uid } from '@/lib/id';
import type { Category } from '@/lib/types';
import { useCloset } from '@/store/closet';

interface Row {
  key: string;
  selected: boolean;
  name: string;
  image?: string;
  brand?: string;
  price?: number;
  category: Category;
  sourceUrl: string;
}

const STORES: { name: string; url: string }[] = [
  { name: 'Amazon', url: 'https://www.amazon.com/gp/css/order-history' },
  { name: 'Uniqlo', url: 'https://www.uniqlo.com' },
  { name: 'Zara', url: 'https://www.zara.com' },
  { name: 'SHEIN', url: 'https://www.shein.com' },
  { name: 'Gap', url: 'https://www.gap.com' },
  { name: 'Tommy', url: 'https://nz.tommy.com' },
  { name: 'ASOS', url: 'https://www.asos.com' },
  { name: 'Nordstrom', url: 'https://www.nordstrom.com' },
];

export default function ImportScreen() {
  const router = useRouter();
  const addItem = useCloset((s) => s.addItem);

  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);

  const add = async () => {
    const u = url.trim();
    if (!u || busy) return;
    setBusy(true);
    try {
      const res = await importFromUrl(u);
      if (!res) {
        Alert.alert("Couldn't read that link", 'The store page didn’t expose product details. Try the product page URL (not a search or cart link).');
        return;
      }
      setRows((p) => [
        { key: uid('imp_'), selected: true, name: res.name, image: res.image, brand: res.brand, price: res.price, category: res.category, sourceUrl: res.sourceUrl },
        ...p,
      ]);
      setUrl('');
    } catch {
      Alert.alert('Import failed', 'Could not fetch that link. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  const patch = (key: string, p: Partial<Row>) => setRows((l) => l.map((r) => (r.key === key ? { ...r, ...p } : r)));
  const remove = (key: string) => setRows((l) => l.filter((r) => r.key !== key));

  const selectedCount = rows.filter((r) => r.selected).length;

  const save = () => {
    const chosen = rows.filter((r) => r.selected);
    if (!chosen.length) return;
    for (const r of chosen) {
      addItem({
        name: r.name.trim() || 'Imported item',
        photoUri: r.image ?? '',
        category: r.category,
        brand: r.brand?.trim() || undefined,
        colors: [],
        seasons: [],
        price: r.price,
      });
    }
    router.replace('/wardrobe');
  };

  const header = <TopBar left={<BackTitle title="Import from a link" onBack={() => router.back()} />} />;

  return (
    <Screen header={header} scroll={false} bottomInset={false}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Txt variant="small" color="textMuted">
          Paste a product link from any store and we’ll pull in the photo, name, brand and price.
        </Txt>

        <View style={styles.inputRow}>
          <View style={{ flex: 1 }}>
            <Input
              placeholder="https://store.com/product/..."
              value={url}
              onChangeText={setUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              inputMode="url"
              onSubmitEditing={add}
              returnKeyType="done"
            />
          </View>
          <Button title="Add" compact full={false} onPress={add} disabled={busy || !url.trim()} />
        </View>

        {busy ? (
          <View style={styles.busy}>
            <ActivityIndicator color={palette.blue} />
            <Txt variant="small" color="accent">Reading the product page…</Txt>
          </View>
        ) : null}

        {/* Store shortcuts */}
        <Txt variant="label" color="textSecondary" style={{ marginTop: Spacing.xl, marginBottom: Spacing.sm }}>
          Open a store to find your purchases
        </Txt>
        <View style={styles.storeWrap}>
          {STORES.map((s) => (
            <Pressable key={s.name} style={styles.storeChip} onPress={() => void Linking.openURL(s.url)}>
              <Txt variant="caption">{s.name}</Txt>
              <Ionicons name="open-outline" size={13} color={palette.gray} />
            </Pressable>
          ))}
        </View>

        {/* Imported rows */}
        {rows.length ? (
          <Txt variant="label" color="textSecondary" style={{ marginTop: Spacing.xl, marginBottom: Spacing.sm }}>
            {selectedCount} selected
          </Txt>
        ) : null}
        {rows.map((r) => {
          const meta = categoryMeta(r.category);
          return (
            <View key={r.key} style={styles.card}>
              <Pressable onPress={() => patch(r.key, { selected: !r.selected })} hitSlop={6}>
                <Ionicons name={r.selected ? 'checkbox' : 'square-outline'} size={24} color={r.selected ? palette.ink : palette.gray} />
              </Pressable>
              {r.image ? (
                <Image source={{ uri: r.image }} style={styles.thumb} contentFit="cover" />
              ) : (
                <View style={[styles.thumb, styles.thumbEmpty]}>
                  <Ionicons name="image-outline" size={22} color={palette.silver} />
                </View>
              )}
              <View style={{ flex: 1, gap: 4 }}>
                <Input value={r.name} onChangeText={(t) => patch(r.key, { name: t })} style={styles.nameInput} />
                <Txt variant="caption" color="textMuted" numberOfLines={1}>
                  {[r.brand, r.price ? `$${r.price}` : null].filter(Boolean).join(' · ') || 'Tap category to set'}
                </Txt>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingTop: 2 }}>
                  {CATEGORIES.map((c) => (
                    <Chip key={c.key} label={c.label} selected={r.category === c.key} onPress={() => patch(r.key, { category: c.key })} />
                  ))}
                </ScrollView>
              </View>
              <Pressable onPress={() => remove(r.key)} hitSlop={6}>
                <Ionicons name="close" size={18} color={palette.gray} />
              </Pressable>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <Button title={`Add ${selectedCount} to closet`} onPress={save} disabled={selectedCount === 0} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.md },
  busy: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: Spacing.md },
  storeWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  storeChip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: palette.cloud, paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.pill },
  card: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, borderWidth: 1, borderColor: palette.hairline, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md },
  thumb: { width: 56, height: 56, borderRadius: Radius.md, backgroundColor: palette.cloud },
  thumbEmpty: { alignItems: 'center', justifyContent: 'center' },
  nameInput: { paddingVertical: 6, paddingHorizontal: 8, fontSize: 14 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: Spacing.lg, paddingBottom: Spacing.xl, backgroundColor: palette.white, borderTopWidth: 1, borderTopColor: palette.hairline },
});
