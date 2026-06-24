import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { HeaderActions } from '@/components/header-actions';
import { ItemTile } from '@/components/item-tile';
import { BackTitle } from '@/components/sub-header';
import { TopBar } from '@/components/top-bar';
import { Grid } from '@/components/ui/grid';
import { Ionicons } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { Txt } from '@/components/ui/text';
import { UnderlineTabs } from '@/components/ui/underline-tabs';
import { palette, Radius, Spacing } from '@/constants/theme';
import { CATEGORY_KEYS } from '@/lib/categories';
import { isOwned } from '@/lib/owned';
import type { Category, ClothingItem } from '@/lib/types';
import { ALL_CLOTHES_ID, useCloset } from '@/store/closet';

type CatTab = 'All' | Category;
type GridEntry = ClothingItem | { __add: true };

export default function CollectionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const items = useCloset((s) => s.items);
  const collections = useCloset((s) => s.collections);

  const isAll = id === ALL_CLOTHES_ID;
  const collection = collections.find((c) => c.id === id);
  const title = isAll ? 'All Clothes' : (collection?.name ?? 'Items');

  const [cat, setCat] = useState<CatTab>('All');
  const tabs: CatTab[] = ['All', ...CATEGORY_KEYS];

  const base = useMemo(() => {
    const list = isAll
      ? items.filter(isOwned)
      : items.filter((it) => collection?.itemIds.includes(it.id));
    return [...list].sort((a, b) => +new Date(b.dateAdded) - +new Date(a.dateAdded));
  }, [isAll, items, collection]);

  const shown = useMemo(
    () => (cat === 'All' ? base : base.filter((i) => i.category === cat)),
    [base, cat],
  );

  const data: GridEntry[] = [{ __add: true }, ...shown];

  const header = (
    <TopBar left={<BackTitle title={title} onBack={() => router.back()} />} right={<HeaderActions />} />
  );

  return (
    <Screen header={header}>
      <View style={styles.controls}>
        <View style={styles.pill}>
          <Txt variant="label" color="textSecondary">
            Recently added
          </Txt>
          <Ionicons name="chevron-down" size={14} color={palette.gray} />
        </View>
        <Txt variant="small" color="textMuted">
          {base.length} {base.length === 1 ? 'item' : 'items'}
        </Txt>
      </View>

      <View style={{ marginBottom: Spacing.md }}>
        <UnderlineTabs tabs={tabs} value={cat} onChange={setCat} />
      </View>

      <Grid
        numColumns={3}
        gap={10}
        data={data}
        keyExtractor={(e) => ('__add' in e ? 'add' : e.id)}
        renderItem={(e) =>
          '__add' in e ? (
            <Pressable
              onPress={() => router.push('/add')}
              style={({ pressed }) => [styles.addTile, pressed ? { opacity: 0.7 } : null]}>
              <Ionicons name="add" size={24} color={palette.gray} />
              <Txt variant="caption" color="textMuted">
                Add Items
              </Txt>
            </Pressable>
          ) : (
            <ItemTile
              item={e}
              showMeta
              onPress={() => router.push({ pathname: '/item/[id]', params: { id: e.id } })}
            />
          )
        }
      />

      {shown.length === 0 ? (
        <Txt variant="small" color="textMuted" style={{ marginTop: Spacing.lg }}>
          Nothing in {cat} yet.
        </Txt>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: palette.cloud,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: Radius.pill,
  },
  addTile: {
    aspectRatio: 1,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: palette.hairline,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
});
