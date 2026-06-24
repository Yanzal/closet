import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { BackTitle } from '@/components/sub-header';
import { TopBar } from '@/components/top-bar';
import { Card } from '@/components/ui/card';
import { Ionicons } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { Txt } from '@/components/ui/text';
import { palette, Radius, Spacing } from '@/constants/theme';
import { REVIEW_DIMENSIONS, type ReviewDim } from '@/lib/attributes';
import { isOwned } from '@/lib/owned';
import type { ClothingItem } from '@/lib/types';
import { useCloset } from '@/store/closet';

function filled(item: ClothingItem, dim: ReviewDim): boolean {
  const v = item[dim.key as keyof ClothingItem];
  return Array.isArray(v) ? v.length > 0 : !!v;
}

export default function ReviewScreen() {
  const router = useRouter();
  const items = useCloset((s) => s.items);
  const owned = items.filter(isOwned);

  return (
    <Screen header={<TopBar left={<BackTitle title="Closet Review" onBack={() => router.back()} />} />}>
      <Card tint={palette.cloud} style={styles.banner}>
        <Txt style={{ fontSize: 26 }}>🔍</Txt>
        <Txt variant="small" color="textSecondary" style={{ flex: 1 }}>
          Quickly review and correct your clothes&apos; info. Better info means better outfit suggestions.
        </Txt>
      </Card>

      {REVIEW_DIMENSIONS.map((dim) => {
        const done = owned.filter((i) => filled(i, dim)).length;
        return (
          <Pressable
            key={dim.key}
            onPress={() => router.push({ pathname: '/review/[dim]', params: { dim: dim.key } })}
            style={({ pressed }) => [styles.row, pressed ? { opacity: 0.6 } : null]}>
            <View style={{ flex: 1 }}>
              <View style={styles.titleRow}>
                <Txt variant="h2">{dim.label}</Txt>
                <View style={styles.timeChip}>
                  <Txt variant="caption" color="textMuted">{dim.time}</Txt>
                </View>
              </View>
              <Txt variant="small" color={done === 0 ? 'textMuted' : 'accent'}>
                {owned.length === 0 ? 'Not yet' : `${done}/${owned.length} done`}
              </Txt>
            </View>
            <Ionicons name="chevron-forward" size={20} color={palette.gray} />
          </Pressable>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  banner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md, marginBottom: Spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.lg, borderBottomWidth: 1, borderBottomColor: palette.hairline },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  timeChip: { backgroundColor: palette.cloud, paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.pill },
});
