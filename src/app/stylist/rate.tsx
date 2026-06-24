import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { OutfitPreview } from '@/components/outfit/outfit-preview';
import { BackTitle } from '@/components/sub-header';
import { TopBar } from '@/components/top-bar';
import { Button } from '@/components/ui/button';
import { Ionicons } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { Txt } from '@/components/ui/text';
import { palette, Radius, Spacing } from '@/constants/theme';
import { rateOutfit } from '@/lib/ai/stylist';
import { useCloset } from '@/store/closet';

export default function RateScreen() {
  const router = useRouter();
  const outfits = useCloset((s) => s.outfits);
  const items = useCloset((s) => s.items);
  const [sel, setSel] = useState<string | null>(null);

  const header = <TopBar left={<BackTitle title="Rate my style" onBack={() => router.back()} />} />;

  if (outfits.length === 0) {
    return (
      <Screen header={header}>
        <View style={styles.empty}>
          <Txt style={{ fontSize: 40 }}>⭐</Txt>
          <Txt variant="title">Rate my style</Txt>
          <Txt variant="small" color="textMuted" style={{ textAlign: 'center' }}>
            Save an outfit first, then get a score and quick tips.
          </Txt>
          <Button title="Create outfit" full={false} onPress={() => router.push('/outfit/builder')} />
        </View>
      </Screen>
    );
  }

  const selectedId = sel ?? outfits[0].id;
  const outfit = outfits.find((o) => o.id === selectedId)!;
  const outfitItems = outfit.itemIds
    .map((id) => items.find((i) => i.id === id))
    .filter((x): x is NonNullable<typeof x> => Boolean(x));
  const { score, tips } = rateOutfit(outfitItems);
  const band = score >= 80 ? 'Looking sharp' : score >= 60 ? 'Solid look' : 'Room to refine';
  const color = score >= 80 ? palette.green : score >= 60 ? palette.blue : palette.amber;

  return (
    <Screen header={header}>
      <Txt variant="small" color="textMuted" style={{ marginBottom: Spacing.sm }}>
        Pick an outfit to rate
      </Txt>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {outfits.map((o) => (
          <Pressable key={o.id} onPress={() => setSel(o.id)}>
            <View style={[styles.thumb, o.id === selectedId ? styles.thumbOn : null]}>
              <OutfitPreview items={items} nodes={o.nodes} size={84} />
            </View>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.scoreCard}>
        <Txt style={{ fontSize: 56, lineHeight: 62, fontWeight: '800', color }}>{score}</Txt>
        <Txt variant="bodyStrong" style={{ color }}>{band}</Txt>
        <Txt variant="small" color="textMuted">{outfit.name}</Txt>
      </View>

      <Txt variant="title" style={{ marginTop: Spacing.xl, marginBottom: Spacing.sm }}>Tips</Txt>
      <View style={styles.tips}>
        {tips.map((t, i) => (
          <View key={i} style={styles.tipRow}>
            <Ionicons name="sparkles-outline" size={16} color={palette.blue} />
            <Txt variant="small" color="textSecondary" style={{ flex: 1 }}>{t}</Txt>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: 'center', gap: 10, paddingVertical: Spacing.six },
  row: { gap: Spacing.md, paddingBottom: 4 },
  thumb: { width: 84, height: 84, borderRadius: Radius.md, overflow: 'hidden', borderWidth: 2, borderColor: palette.hairline },
  thumbOn: { borderColor: palette.ink },
  scoreCard: { alignItems: 'center', gap: 2, marginTop: Spacing.xl, paddingVertical: Spacing.lg, backgroundColor: palette.cloud, borderRadius: Radius.xl },
  tips: { gap: Spacing.md },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
});
