import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, LayoutChangeEvent, StyleSheet, View } from 'react-native';

import { OutfitPreview } from '@/components/outfit/outfit-preview';
import { BackTitle } from '@/components/sub-header';
import { TopBar } from '@/components/top-bar';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Ionicons } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { Txt } from '@/components/ui/text';
import { palette, Radius, Spacing } from '@/constants/theme';
import { generateConfigured } from '@/lib/ai/config';
import { appleIntelligenceAvailable } from '@/lib/ai/native';
import { buildLookNodes, suggestOutfitSmart, type Warmth } from '@/lib/ai/stylist';
import { isOwned } from '@/lib/owned';
import type { ClothingItem, PlacedNode } from '@/lib/types';
import { useCloset } from '@/store/closet';

export default function SuggestScreen() {
  const router = useRouter();
  const items = useCloset((s) => s.items);
  const addOutfit = useCloset((s) => s.addOutfit);

  const [warmth, setWarmth] = useState<Warmth>('mild');
  const [look, setLook] = useState<ClothingItem[]>([]);
  const [nodes, setNodes] = useState<PlacedNode[]>([]);
  const [w, setW] = useState(0);
  const [loading, setLoading] = useState(false);

  const owned = items.filter(isOwned);
  const tooFew = owned.length < 2;

  const shuffle = async (warm: Warmth = warmth) => {
    setLoading(true);
    try {
      const l = await suggestOutfitSmart(items, warm);
      setLook(l);
      setNodes(buildLookNodes(l));
    } finally {
      setLoading(false);
    }
  };

  // Generate once the closet is available (store hydrates after first render).
  useEffect(() => {
    if (look.length === 0 && owned.length >= 2) void shuffle('mild');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  const save = () => {
    if (!look.length) return;
    const id = addOutfit({ name: "Today's look", nodes });
    router.replace({ pathname: '/outfit/[id]', params: { id } });
  };

  const header = <TopBar left={<BackTitle title="Outfit suggestion" onBack={() => router.back()} />} />;

  return (
    <Screen header={header}>
      <Txt variant="small" color="textMuted">
        {appleIntelligenceAvailable
          ? 'Styled by Apple Intelligence — on device, no cloud.'
          : generateConfigured
            ? 'Styled by AI from your closet.'
            : 'Styled from your closet — on device, no cloud.'}
      </Txt>

      <View style={styles.warmRow}>
        {(['warm', 'mild', 'cold'] as Warmth[]).map((wv) => (
          <Chip
            key={wv}
            label={wv === 'warm' ? '☀️ Warm' : wv === 'mild' ? '⛅ Mild' : '❄️ Cold'}
            selected={warmth === wv}
            onPress={() => {
              setWarmth(wv);
              shuffle(wv);
            }}
          />
        ))}
      </View>

      {tooFew ? (
        <Txt variant="small" color="textMuted" style={{ marginTop: Spacing.xl }}>
          Add a few more items to your closet and I&apos;ll style you a look.
        </Txt>
      ) : (
        <>
          <View style={styles.canvas} onLayout={(e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width)}>
            {loading ? (
              <ActivityIndicator color={palette.ink} />
            ) : w > 0 && nodes.length > 0 ? (
              <OutfitPreview items={items} nodes={nodes} size={w} />
            ) : null}
          </View>

          <View style={styles.tags}>
            {look.map((it) => (
              <Txt key={it.id} variant="caption" color="textSecondary" style={styles.tag}>
                {it.name}
              </Txt>
            ))}
          </View>

          <View style={styles.actions}>
            <Button
              title="Shuffle"
              variant="secondary"
              full={false}
              disabled={loading}
              leftIcon={<Ionicons name="shuffle" size={18} color={palette.ink} />}
              onPress={() => void shuffle()}
              style={{ flex: 1 }}
            />
            <Button
              title="Save look"
              full={false}
              disabled={loading || look.length === 0}
              leftIcon={<Ionicons name="bookmark-outline" size={18} color="#fff" />}
              onPress={save}
              style={{ flex: 1 }}
            />
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  warmRow: { flexDirection: 'row', gap: 8, marginTop: Spacing.md },
  canvas: {
    aspectRatio: 1,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: palette.hairline,
    backgroundColor: palette.white,
    overflow: 'hidden',
    marginTop: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: Spacing.md },
  tag: { backgroundColor: palette.cloud, paddingVertical: 6, paddingHorizontal: 12, borderRadius: Radius.pill },
  actions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.xl },
});
