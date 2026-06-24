import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';

import { OutfitPreview } from '@/components/outfit/outfit-preview';
import { BackTitle } from '@/components/sub-header';
import { TopBar } from '@/components/top-bar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Ionicons } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/icon-button';
import { Screen } from '@/components/ui/screen';
import { Txt } from '@/components/ui/text';
import { palette, Radius, Spacing } from '@/constants/theme';
import { buildLookNodes } from '@/lib/ai/stylist';
import type { Category, ClothingItem, PlacedNode } from '@/lib/types';
import { useCloset } from '@/store/closet';

const sample = <T,>(a: T[]) => (a.length ? a[Math.floor(Math.random() * a.length)] : undefined);

/** Inspiration looks blending wishlist + closet items. Inspiration only — not saveable. */
function buildLook(items: ClothingItem[], wishlistFirst: boolean): ClothingItem[] {
  const pool = items.filter((i) => !i.archived);
  const wish = pool.filter((i) => i.wishlist);
  const byCat = (c: Category) => {
    const w = wish.filter((i) => i.category === c);
    const all = pool.filter((i) => i.category === c);
    return wishlistFirst && w.length ? w : all;
  };
  const picks = [
    sample(byCat('Tops')),
    sample(byCat('Bottoms')),
    sample(byCat('Outerwear')),
    sample(byCat('Shoes')),
    sample(byCat('Bags')),
  ].filter(Boolean) as ClothingItem[];
  return picks.slice(0, 5);
}

export default function WishlistSuggestionScreen() {
  const router = useRouter();
  const items = useCloset((s) => s.items);
  const [nodes, setNodes] = useState<PlacedNode[]>([]);
  const [w, setW] = useState(0);

  const hasWish = items.some((i) => i.wishlist);

  const regen = () => setNodes(buildLookNodes(buildLook(items, true)));
  useEffect(() => {
    regen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  return (
    <Screen header={<TopBar left={<BackTitle title="Outfit suggestion" onBack={() => router.back()} />} right={<IconButton onPress={regen}><Ionicons name="refresh" size={20} color={palette.ink} /></IconButton>} />}>
      {!hasWish ? (
        <Card style={styles.empty}>
          <Ionicons name="heart-outline" size={40} color={palette.silver} />
          <Txt variant="title">No items on wishlist</Txt>
          <Txt variant="small" color="textMuted" style={{ textAlign: 'center' }}>
            Add a few wishlist items and we&apos;ll style them with your closet.
          </Txt>
          <Button title="Add items" full={false} onPress={() => router.push('/add?wishlist=1')} />
        </Card>
      ) : (
        <>
          <Txt variant="h2">How about trying this look?</Txt>
          <Txt variant="small" color="textMuted" style={{ marginTop: 2 }}>
            Ideas from your wishlist + closet. For inspiration only — these can&apos;t be saved.
          </Txt>
          <View style={styles.canvas} onLayout={(e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width)}>
            {w > 0 && nodes.length > 0 ? <OutfitPreview items={items} nodes={nodes} size={w} /> : null}
          </View>
          <Button title="Try another" variant="secondary" onPress={regen} style={{ marginTop: Spacing.lg }} />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: 'center', gap: 10, paddingVertical: Spacing.six, paddingHorizontal: Spacing.lg, marginTop: Spacing.lg },
  canvas: {
    aspectRatio: 1,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: palette.hairline,
    backgroundColor: palette.white,
    overflow: 'hidden',
    marginTop: Spacing.lg,
  },
});
