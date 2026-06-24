import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, LayoutChangeEvent, ScrollView, StyleSheet, View } from 'react-native';

import { ItemTile } from '@/components/item-tile';
import { OutfitPreview } from '@/components/outfit/outfit-preview';
import { BackTitle } from '@/components/sub-header';
import { TopBar } from '@/components/top-bar';
import { Button } from '@/components/ui/button';
import { Ionicons } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/icon-button';
import { Screen } from '@/components/ui/screen';
import { Txt } from '@/components/ui/text';
import { palette, Radius, Spacing } from '@/constants/theme';
import { useCloset } from '@/store/closet';

export default function OutfitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const outfit = useCloset((s) => s.outfits.find((o) => o.id === id));
  const items = useCloset((s) => s.items);
  const removeOutfit = useCloset((s) => s.removeOutfit);
  const [w, setW] = useState(0);

  if (!outfit) {
    return (
      <Screen header={<TopBar left={<BackTitle title="Outfit" onBack={() => router.back()} />} />}>
        <Txt color="textSecondary">This outfit was not found.</Txt>
      </Screen>
    );
  }

  const outfitItems = outfit.itemIds
    .map((iid) => items.find((i) => i.id === iid))
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  const onDelete = () =>
    Alert.alert('Delete outfit', `Remove “${outfit.name}”?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          removeOutfit(outfit.id);
          router.back();
        },
      },
    ]);

  const header = (
    <TopBar
      left={<BackTitle title="" onBack={() => router.back()} />}
      right={
        <>
          <IconButton onPress={() => router.push({ pathname: '/outfit/builder', params: { id: outfit.id } })}>
            <Ionicons name="create-outline" size={22} color={palette.ink} />
          </IconButton>
          <IconButton onPress={onDelete}>
            <Ionicons name="trash-outline" size={22} color={palette.ink} />
          </IconButton>
        </>
      }
    />
  );

  return (
    <Screen header={header}>
      <View
        style={styles.canvas}
        onLayout={(e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width)}>
        {w > 0 ? <OutfitPreview items={items} nodes={outfit.nodes} size={w} /> : null}
      </View>

      <Txt variant="h2" style={{ marginTop: Spacing.lg }}>
        {outfit.name}
      </Txt>
      <Txt variant="small" color="textMuted">
        {outfitItems.length} {outfitItems.length === 1 ? 'item' : 'items'} ·{' '}
        {new Date(outfit.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
      </Txt>

      <Txt variant="label" color="textSecondary" style={{ marginTop: Spacing.xl, marginBottom: Spacing.sm }}>
        Items
      </Txt>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.itemRow}>
        {outfitItems.map((it) => (
          <View key={it.id} style={{ width: 96 }}>
            <ItemTile item={it} showMeta onPress={() => router.push({ pathname: '/item/[id]', params: { id: it.id } })} />
          </View>
        ))}
      </ScrollView>

      <Button
        title="Edit outfit"
        variant="secondary"
        leftIcon={<Ionicons name="create-outline" size={18} color={palette.ink} />}
        onPress={() => router.push({ pathname: '/outfit/builder', params: { id: outfit.id } })}
        style={{ marginTop: Spacing.xl }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  canvas: {
    aspectRatio: 1,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.hairline,
  },
  itemRow: { gap: Spacing.md, paddingBottom: 4 },
});
