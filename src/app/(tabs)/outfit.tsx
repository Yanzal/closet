import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { MonthCalendar } from '@/components/calendar/month-calendar';
import { HeaderActions } from '@/components/header-actions';
import { OutfitPreview } from '@/components/outfit/outfit-preview';
import { TopBar } from '@/components/top-bar';
import { TripsPane } from '@/components/trips/trips-pane';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Grid } from '@/components/ui/grid';
import { Ionicons } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { Txt } from '@/components/ui/text';
import { UnderlineTabs } from '@/components/ui/underline-tabs';
import { palette, Radius, Spacing } from '@/constants/theme';
import type { Outfit } from '@/lib/types';
import { useCloset } from '@/store/closet';

type Tab = 'Outfit' | 'Packing' | 'Calendar';
type GridEntry = { create: true } | Outfit;

export default function OutfitScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('Outfit');
  const outfits = useCloset((s) => s.outfits);
  const items = useCloset((s) => s.items);

  return (
    <Screen header={<TopBar title="Outfit" right={<HeaderActions />} />}>
      <View style={{ marginBottom: Spacing.lg }}>
        <UnderlineTabs tabs={['Outfit', 'Packing', 'Calendar']} value={tab} onChange={setTab} />
      </View>

      {tab === 'Calendar' ? (
        <MonthCalendar />
      ) : tab === 'Packing' ? (
        <TripsPane />
      ) : outfits.length === 0 ? (
        <Card style={styles.empty}>
          <Txt style={{ fontSize: 40 }}>🧶</Txt>
          <Txt variant="title">Add ideas for your outfit</Txt>
          <Txt variant="small" color="textMuted" style={{ textAlign: 'center' }}>
            Combine items on a canvas and save the looks you love.
          </Txt>
          <Button
            title="Create outfit"
            full={false}
            leftIcon={<Ionicons name="add" size={18} color="#fff" />}
            onPress={() => router.push('/outfit/builder')}
            style={{ marginTop: 4 }}
          />
        </Card>
      ) : (
        <Grid
          numColumns={2}
          gap={Spacing.lg}
          data={[{ create: true } as GridEntry, ...outfits]}
          keyExtractor={(e) => ('create' in e ? 'create' : e.id)}
          renderItem={(e, _i, size) =>
            'create' in e ? (
              <Pressable
                onPress={() => router.push('/outfit/builder')}
                style={({ pressed }) => [styles.createTile, { height: size }, pressed ? { opacity: 0.7 } : null]}>
                <Ionicons name="add" size={26} color={palette.gray} />
                <Txt variant="small" color="textMuted">New outfit</Txt>
              </Pressable>
            ) : (
              <Pressable onPress={() => router.push({ pathname: '/outfit/[id]', params: { id: e.id } })}>
                <View style={[styles.outfitThumb, { width: size, height: size }]}>
                  <OutfitPreview items={items} nodes={e.nodes} size={size} />
                </View>
                <Txt variant="bodyStrong" numberOfLines={1} style={{ marginTop: 8 }}>
                  {e.name}
                </Txt>
                <Txt variant="caption" color="textMuted">
                  {e.itemIds.length} {e.itemIds.length === 1 ? 'item' : 'items'}
                </Txt>
              </Pressable>
            )
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: 'center', gap: 10, paddingVertical: Spacing.six, paddingHorizontal: Spacing.lg },
  createTile: {
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: palette.hairline,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  outfitThumb: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: palette.hairline,
    backgroundColor: palette.white,
  },
});
