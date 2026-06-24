import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { PlaceholderThumb } from '@/components/placeholder-thumb';
import { Ionicons } from '@/components/ui/icon';
import { Txt } from '@/components/ui/text';
import { palette, Radius } from '@/constants/theme';
import type { ClothingItem } from '@/lib/types';

function Cell({ item, counter }: { item?: ClothingItem; counter?: number }) {
  return (
    <View style={styles.cell}>
      {counter != null ? (
        <View style={styles.counter}>
          <Txt variant="bodyStrong">+{counter}</Txt>
        </View>
      ) : item ? (
        item.photoUri ? (
          <Image source={{ uri: item.photoUri }} style={styles.fill} contentFit="cover" />
        ) : (
          <PlaceholderThumb category={item.category} radius={0} glyphSize={22} style={styles.fill} />
        )
      ) : null}
    </View>
  );
}

/** Closet collection tile: a 2×2 mosaic of items, with name + count below. */
export function CollectionCard({
  title,
  count,
  items,
  onPress,
}: {
  title: string;
  count: number;
  items: ClothingItem[];
  onPress?: () => void;
}) {
  // Up to 4 cells; if there are more than 4 items, the last cell is a "+N" counter.
  const cells: { item?: ClothingItem; counter?: number }[] =
    count > 4
      ? [...items.slice(0, 3).map((item) => ({ item })), { counter: count - 3 }]
      : items.slice(0, 4).map((item) => ({ item }));
  while (cells.length < 4) cells.push({});

  return (
    <Pressable onPress={onPress} style={({ pressed }) => (pressed ? { opacity: 0.85 } : null)}>
      <View style={styles.mosaic}>
        <View style={styles.row}>
          <Cell {...cells[0]} />
          <Cell {...cells[1]} />
        </View>
        <View style={styles.row}>
          <Cell {...cells[2]} />
          <Cell {...cells[3]} />
        </View>
      </View>
      <Txt variant="bodyStrong" numberOfLines={1} style={styles.title}>
        {title}
      </Txt>
      <Txt variant="caption" color="textMuted">
        {count} {count === 1 ? 'item' : 'items'}
      </Txt>
    </Pressable>
  );
}

/** Dashed "Create closet" tile matching the collection card footprint. */
export function CreateCollectionCard({ onPress }: { onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => (pressed ? { opacity: 0.7 } : null)}>
      <View style={styles.create}>
        <Ionicons name="add" size={26} color={palette.gray} />
        <Txt variant="small" color="textMuted">
          Create closet
        </Txt>
      </View>
      <Txt variant="bodyStrong" numberOfLines={1} style={[styles.title, { opacity: 0 }]}>
        .
      </Txt>
    </Pressable>
  );
}

const GAP = 3;
const styles = StyleSheet.create({
  mosaic: {
    aspectRatio: 1,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    gap: GAP,
    backgroundColor: palette.hairline,
  },
  row: { flex: 1, flexDirection: 'row', gap: GAP },
  cell: { flex: 1, backgroundColor: palette.cloud, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  counter: { flex: 1, alignSelf: 'stretch', backgroundColor: palette.mist, alignItems: 'center', justifyContent: 'center' },
  fill: { width: '100%', height: '100%' },
  title: { marginTop: 10 },
  create: {
    aspectRatio: 1,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: palette.hairline,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
});
