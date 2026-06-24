import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ItemTile } from '@/components/item-tile';
import { BackTitle } from '@/components/sub-header';
import { TopBar } from '@/components/top-bar';
import { Grid } from '@/components/ui/grid';
import { Ionicons } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { Txt } from '@/components/ui/text';
import { palette, Spacing } from '@/constants/theme';
import { useCloset } from '@/store/closet';

export default function ArchiveScreen() {
  const router = useRouter();
  const items = useCloset((s) => s.items);
  const archived = items.filter((i) => i.archived);

  return (
    <Screen header={<TopBar left={<BackTitle title="Archive" onBack={() => router.back()} />} />}>
      {archived.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="file-tray-outline" size={48} color={palette.silver} />
          <Txt variant="title">There are no archived clothes</Txt>
          <Txt variant="small" color="textMuted" style={{ textAlign: 'center' }}>
            Archive pieces you don&apos;t wear to keep your closet tidy — without deleting them.
          </Txt>
        </View>
      ) : (
        <Grid
          numColumns={3}
          gap={10}
          data={archived}
          keyExtractor={(it) => it.id}
          renderItem={(it) => (
            <ItemTile item={it} showMeta onPress={() => router.push({ pathname: '/item/[id]', params: { id: it.id } })} />
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: 'center', gap: 10, paddingTop: Spacing.six },
});
