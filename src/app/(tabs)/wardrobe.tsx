import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { CollectionCard, CreateCollectionCard } from '@/components/collection-card';
import { HeaderActions } from '@/components/header-actions';
import { QuickAction } from '@/components/quick-action';
import { TopBar } from '@/components/top-bar';
import { Card } from '@/components/ui/card';
import { Grid } from '@/components/ui/grid';
import { Feather, Ionicons, MaterialCommunityIcons } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { Txt } from '@/components/ui/text';
import { palette, Spacing } from '@/constants/theme';
import { isOwned } from '@/lib/owned';
import { comingSoon } from '@/lib/ui';
import type { Collection } from '@/lib/types';
import { ALL_CLOTHES_ID, useCloset } from '@/store/closet';

type Tile = { kind: 'all' } | { kind: 'collection'; collection: Collection } | { kind: 'create' };

export default function ClosetScreen() {
  const router = useRouter();
  const items = useCloset((s) => s.items);
  const collections = useCloset((s) => s.collections);
  const owned = items.filter(isOwned);

  const tiles: Tile[] = useMemo(
    () => [
      { kind: 'all' },
      ...collections.map((collection) => ({ kind: 'collection', collection }) as Tile),
      { kind: 'create' },
    ],
    [collections],
  );

  const openAll = () => router.push({ pathname: '/collection/[id]', params: { id: ALL_CLOTHES_ID } });

  const header = <TopBar title="Closet" caret onTitlePress={openAll} right={<HeaderActions />} />;

  return (
    <Screen header={header}>
      <Card tint={palette.sky} style={styles.banner}>
        <Txt style={{ fontSize: 22 }}>🧺</Txt>
        <View style={{ flexShrink: 1 }}>
          <Txt variant="bodyStrong">{owned.length} pieces and counting</Txt>
          <Txt variant="small" color="textSecondary">
            Keep building — your stylist gets smarter.
          </Txt>
        </View>
      </Card>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickRow}>
        <QuickAction
          label="Import"
          onPress={() => router.push('/import')}
          icon={<Ionicons name="cloud-download-outline" size={22} color={palette.ink} />}
        />
        <QuickAction
          label="Style stats"
          onPress={() => router.push('/stats')}
          icon={<Ionicons name="trending-up" size={22} color={palette.ink} />}
        />
        <QuickAction
          label="Wishlist"
          onPress={() => router.push('/wishlist')}
          icon={<Ionicons name="heart-outline" size={22} color={palette.ink} />}
        />
        <QuickAction
          label="Beautify"
          onPress={() => router.push({ pathname: '/stylist/[feature]', params: { feature: 'beautify' } })}
          icon={<MaterialCommunityIcons name="auto-fix" size={22} color={palette.ink} />}
        />
        <QuickAction
          label="Share"
          onPress={() => comingSoon('Share closet')}
          icon={<Feather name="share-2" size={20} color={palette.ink} />}
        />
        <QuickAction
          label="Review"
          onPress={() => router.push('/review')}
          icon={<Ionicons name="clipboard-outline" size={20} color={palette.ink} />}
        />
      </ScrollView>

      <Grid
        numColumns={2}
        gap={Spacing.lg}
        data={tiles}
        keyExtractor={(t, i) => (t.kind === 'collection' ? t.collection.id : `${t.kind}-${i}`)}
        renderItem={(t) => {
          if (t.kind === 'all') {
            return (
              <CollectionCard title="All Clothes" count={owned.length} items={owned} onPress={openAll} />
            );
          }
          if (t.kind === 'collection') {
            const colItems = items.filter((it) => t.collection.itemIds.includes(it.id));
            return (
              <CollectionCard
                title={t.collection.name}
                count={t.collection.itemIds.length}
                items={colItems}
                onPress={() =>
                  router.push({ pathname: '/collection/[id]', params: { id: t.collection.id } })
                }
              />
            );
          }
          return <CreateCollectionCard onPress={() => router.push('/collection/new')} />;
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  quickRow: { gap: 6, paddingBottom: Spacing.lg },
});
