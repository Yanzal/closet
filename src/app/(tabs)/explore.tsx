import { StyleSheet, View } from 'react-native';

import { HeaderActions } from '@/components/header-actions';
import { TopBar } from '@/components/top-bar';
import { Card } from '@/components/ui/card';
import { Ionicons } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { Txt } from '@/components/ui/text';
import { palette, Radius, Spacing } from '@/constants/theme';

export default function ExploreScreen() {
  return (
    <Screen header={<TopBar title="Explore" right={<HeaderActions />} />}>
      <Card style={styles.empty}>
        <Ionicons name="compass-outline" size={42} color={palette.gray} />
        <Txt variant="title">Discover outfits</Txt>
        <Txt variant="small" color="textMuted" style={{ textAlign: 'center' }}>
          Search community looks by clothes and follow styles you love.
        </Txt>
        <View style={styles.badge}>
          <Ionicons name="sparkles-outline" size={13} color={palette.blue} />
          <Txt variant="caption" color="accent">Social feed — a later milestone</Txt>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: Spacing.six,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: palette.blueSoft,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.pill,
    marginTop: 4,
  },
});
