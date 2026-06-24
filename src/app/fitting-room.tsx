import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { PlaceholderThumb } from '@/components/placeholder-thumb';
import { Ionicons } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/icon-button';
import { Screen } from '@/components/ui/screen';
import { Txt } from '@/components/ui/text';
import { TopBar } from '@/components/top-bar';
import { palette, Radius, Spacing } from '@/constants/theme';
import type { Category, ClothingItem } from '@/lib/types';
import { useCloset } from '@/store/closet';

const SLOTS: Category[] = ['Outerwear', 'Tops', 'Bottoms', 'Shoes', 'Bags'];
type Source = 'All' | 'Wishlist' | 'Closet';

export default function FittingRoomScreen() {
  const router = useRouter();
  const items = useCloset((s) => s.items);
  const [source, setSource] = useState<Source>('All');
  const [selected, setSelected] = useState<Record<string, string>>({});

  const pool = items.filter((i) =>
    source === 'Wishlist' ? i.wishlist : source === 'Closet' ? !i.wishlist && !i.archived : !i.archived,
  );
  const byCat = (c: Category) => pool.filter((i) => i.category === c);

  const shuffle = () => {
    const next: Record<string, string> = {};
    SLOTS.forEach((c) => {
      const arr = byCat(c);
      if (arr.length) next[c] = arr[Math.floor(Math.random() * arr.length)].id;
    });
    setSelected(next);
  };

  useEffect(() => {
    shuffle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, items.length]);

  const header = (
    <TopBar
      left={
        <IconButton onPress={() => router.back()} style={{ marginLeft: -8 }}>
          <Ionicons name="close" size={26} color={palette.ink} />
        </IconButton>
      }
      right={
        <IconButton onPress={shuffle}>
          <Ionicons name="shuffle" size={22} color={palette.ink} />
        </IconButton>
      }
    />
  );

  return (
    <Screen header={header}>
      <Txt variant="h2">Fitting room</Txt>
      <Txt variant="small" color="textMuted" style={{ marginTop: 2 }}>
        Mix and match items to see how they look before you buy.
      </Txt>

      <View style={styles.sourceRow}>
        {(['All', 'Closet', 'Wishlist'] as Source[]).map((s) => (
          <Pressable
            key={s}
            onPress={() => setSource(s)}
            style={[styles.sourceChip, source === s ? styles.sourceOn : null]}>
            <Txt variant="label" color={source === s ? 'onPrimary' : 'textSecondary'}>{s}</Txt>
          </Pressable>
        ))}
      </View>

      <View style={{ gap: Spacing.md, marginTop: Spacing.lg }}>
        {SLOTS.map((cat) => {
          const arr = byCat(cat);
          const chosen = selected[cat];
          return (
            <View key={cat} style={styles.slot}>
              <Txt variant="label" color="textSecondary" style={{ marginBottom: 8 }}>{cat}</Txt>
              {arr.length === 0 ? (
                <View style={styles.emptySlot}>
                  <Txt variant="small" color="textMuted">No {cat} in {source.toLowerCase()}</Txt>
                  <Pressable onPress={() => router.push('/add')} style={styles.addBtn}>
                    <Txt variant="caption" color="text">Add items</Txt>
                  </Pressable>
                </View>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.itemRow}>
                  {arr.map((it) => (
                    <Pressable key={it.id} onPress={() => setSelected((p) => ({ ...p, [cat]: it.id }))}>
                      <View style={[styles.thumb, chosen === it.id ? styles.thumbOn : null]}>
                        <Thumb item={it} />
                      </View>
                    </Pressable>
                  ))}
                </ScrollView>
              )}
            </View>
          );
        })}
      </View>
    </Screen>
  );
}

function Thumb({ item }: { item: ClothingItem }) {
  return item.photoUri ? (
    <Image source={{ uri: item.photoUri }} style={styles.fill} contentFit="contain" />
  ) : (
    <PlaceholderThumb category={item.category} radius={Radius.md} glyphSize={26} style={styles.fill} />
  );
}

const styles = StyleSheet.create({
  sourceRow: { flexDirection: 'row', gap: 8, marginTop: Spacing.md },
  sourceChip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: Radius.pill, backgroundColor: palette.cloud },
  sourceOn: { backgroundColor: palette.black },
  slot: { borderWidth: 1, borderColor: palette.hairline, borderRadius: Radius.lg, padding: Spacing.md },
  emptySlot: { alignItems: 'center', gap: 8, paddingVertical: Spacing.md },
  addBtn: { borderWidth: 1, borderColor: palette.hairline, borderRadius: Radius.pill, paddingVertical: 6, paddingHorizontal: 14 },
  itemRow: { gap: Spacing.sm, paddingRight: 4 },
  thumb: { width: 84, height: 84, borderRadius: Radius.md, overflow: 'hidden', backgroundColor: palette.cloud, borderWidth: 2, borderColor: 'transparent' },
  thumbOn: { borderColor: palette.ink },
  fill: { width: '100%', height: '100%' },
});
