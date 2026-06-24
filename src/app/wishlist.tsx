import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ItemTile } from '@/components/item-tile';
import { BackTitle } from '@/components/sub-header';
import { TopBar } from '@/components/top-bar';
import { Grid } from '@/components/ui/grid';
import { Ionicons } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { Txt } from '@/components/ui/text';
import { palette, Radius, Spacing } from '@/constants/theme';
import { useCloset } from '@/store/closet';

export default function WishlistScreen() {
  const router = useRouter();
  const items = useCloset((s) => s.items);
  const wish = items.filter((i) => i.wishlist);

  return (
    <Screen header={<TopBar left={<BackTitle title="Wishlist" onBack={() => router.back()} />} />}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.shortcuts}>
        <Pressable style={[styles.card, styles.cardDark]} onPress={() => router.push('/add?wishlist=1')}>
          <Txt variant="bodyStrong" color="onPrimary">Add on{'\n'}wishlist</Txt>
          <Ionicons name="add" size={22} color="#fff" />
        </Pressable>
        <Pressable style={styles.card} onPress={() => router.push('/fitting-room')}>
          <Txt variant="bodyStrong">Fitting{'\n'}room</Txt>
          <Ionicons name="chevron-forward" size={18} color={palette.gray} />
        </Pressable>
        <Pressable style={styles.card} onPress={() => router.push('/wishlist-suggestion')}>
          <Txt variant="bodyStrong">Outfit{'\n'}suggestion</Txt>
          <Ionicons name="chevron-forward" size={18} color={palette.gray} />
        </Pressable>
      </ScrollView>

      {wish.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="heart-outline" size={44} color={palette.silver} />
          <Txt variant="title">Wish it, add it</Txt>
          <Txt variant="small" color="textMuted" style={{ textAlign: 'center' }}>
            Save items you&apos;re considering and see how they fit in your closet.
          </Txt>
        </View>
      ) : (
        <View style={{ marginTop: Spacing.lg }}>
          <Grid
            numColumns={3}
            gap={10}
            data={wish}
            keyExtractor={(it) => it.id}
            renderItem={(it) => (
              <ItemTile item={it} showMeta onPress={() => router.push({ pathname: '/item/[id]', params: { id: it.id } })} />
            )}
          />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  shortcuts: { gap: Spacing.md, paddingBottom: 4 },
  card: {
    width: 130,
    height: 96,
    borderRadius: Radius.lg,
    backgroundColor: palette.cloud,
    padding: Spacing.md,
    justifyContent: 'space-between',
  },
  cardDark: { backgroundColor: palette.black },
  empty: { alignItems: 'center', gap: 10, paddingTop: Spacing.six },
});
