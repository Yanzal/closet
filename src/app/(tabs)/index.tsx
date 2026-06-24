import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { HeaderActions } from '@/components/header-actions';
import { ItemTile } from '@/components/item-tile';
import { PlaceholderThumb } from '@/components/placeholder-thumb';
import { QuickAction } from '@/components/quick-action';
import { TopBar } from '@/components/top-bar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Feather, Ionicons, MaterialCommunityIcons } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { Txt } from '@/components/ui/text';
import { palette, Radius, Spacing } from '@/constants/theme';
import { comingSoon } from '@/lib/ui';
import { isOwned } from '@/lib/owned';
import type { ClothingItem } from '@/lib/types';
import { ALL_CLOTHES_ID, useCloset } from '@/store/closet';

const UNLOCK_AT = 5;

export default function HomeScreen() {
  const router = useRouter();
  const hydrated = useCloset((s) => s.hydrated);
  const items = useCloset((s) => s.items);
  const profileName = useCloset((s) => s.profileName);
  const name = profileName?.trim() || 'Guest';

  const owned = useMemo(() => items.filter(isOwned), [items]);

  const recent = useMemo(
    () =>
      [...owned]
        .sort((a, b) => +new Date(b.dateAdded) - +new Date(a.dateAdded))
        .slice(0, 8),
    [owned],
  );

  const looks = useMemo(() => buildLooks(owned), [owned]);

  if (!hydrated) {
    return (
      <Screen scroll={false}>
        <View style={styles.center}>
          <ActivityIndicator color={palette.ink} />
        </View>
      </Screen>
    );
  }

  const header = <TopBar title={`Hello, ${name}`} right={<HeaderActions />} />;

  // Onboarding empty state (mockup 2)
  if (owned.length === 0) {
    return (
      <Screen header={header}>
        <Txt variant="h2">Build your closet</Txt>
        <Txt variant="small" color="textMuted" style={{ marginTop: 4 }}>
          Snap a photo — tag it and add it, all in seconds.
        </Txt>
        <Card tint={palette.cloud} style={styles.onboardHero}>
          <Ionicons name="shirt-outline" size={40} color={palette.gray} />
          <Txt variant="small" color="textMuted">Add to closet</Txt>
        </Card>
        <Card style={styles.unlockCard} shadow>
          <View style={styles.unlockRow}>
            <Txt style={{ fontSize: 18 }}>✨</Txt>
            <Txt variant="bodyStrong" style={{ flexShrink: 1 }}>
              Add {UNLOCK_AT} items to unlock your personalized styling
            </Txt>
          </View>
          <Progress value={0} max={UNLOCK_AT} />
          <Button
            title="Add item"
            leftIcon={<Ionicons name="add" size={18} color="#fff" />}
            onPress={() => router.push('/add')}
            style={{ marginTop: Spacing.md }}
          />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen header={header}>
      {owned.length < UNLOCK_AT ? (
        <Card style={styles.unlockCardSlim} tint={palette.blueSoft}>
          <View style={styles.unlockRow}>
            <Txt style={{ fontSize: 16 }}>✨</Txt>
            <Txt variant="small" style={{ flexShrink: 1 }}>
              {UNLOCK_AT - owned.length} more to unlock personalized styling
            </Txt>
          </View>
          <Progress value={owned.length} max={UNLOCK_AT} />
        </Card>
      ) : null}

      {/* AI Stylist hub */}
      <Txt variant="title" style={{ marginBottom: Spacing.md }}>
        AI Stylist
      </Txt>
      <View style={styles.bigRow}>
        <BigCard
          title="Outfit suggestion"
          emoji="🧥"
          tint={palette.cloud}
          onPress={() => router.push('/stylist/suggest')}
        />
        <BigCard
          title="Style chat"
          emoji="💬"
          tint={palette.cloud}
          onPress={() => router.push({ pathname: '/stylist/[feature]', params: { feature: 'chat' } })}
        />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickRow}>
        <QuickAction
          label="Find my color"
          onPress={() => router.push('/stylist/color')}
          icon={<Ionicons name="color-palette-outline" size={22} color={palette.ink} />}
        />
        <QuickAction
          label="Find my fit"
          onPress={() => router.push({ pathname: '/stylist/[feature]', params: { feature: 'fit' } })}
          icon={<MaterialCommunityIcons name="human" size={22} color={palette.ink} />}
        />
        <QuickAction
          label="Rate style"
          onPress={() => router.push('/stylist/rate')}
          icon={<Ionicons name="star-outline" size={22} color={palette.ink} />}
        />
        <QuickAction
          label="Try On"
          onPress={() => router.push({ pathname: '/stylist/[feature]', params: { feature: 'tryon' } })}
          icon={<MaterialCommunityIcons name="hanger" size={22} color={palette.ink} />}
        />
      </ScrollView>

      {/* Daily look */}
      {looks.length > 0 ? (
        <View style={{ marginTop: Spacing.sm }}>
          <Txt variant="h2">Today&apos;s looks</Txt>
          <Pressable style={styles.metaRow} onPress={() => comingSoon('Weather', 'Forecast — Milestone 3.')}>
            <Ionicons name="calendar-outline" size={14} color={palette.gray} />
            <Txt variant="small" color="textMuted">{todayLabel()}</Txt>
            <Txt variant="small" color="textMuted">·</Txt>
            <Ionicons name="location-outline" size={14} color={palette.gray} />
            <Txt variant="small" color="textMuted">Set city</Txt>
            <Txt variant="small" color="textMuted">·</Txt>
            <Ionicons name="partly-sunny-outline" size={14} color={palette.gray} />
            <Txt variant="small" color="textMuted">—°</Txt>
          </Pressable>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.lookRow}>
            {looks.map((look, i) => (
              <LookCard key={i} items={look} onPress={() => comingSoon('Outfit suggestion', 'AI stylist — Milestone 5.')} />
            ))}
          </ScrollView>
        </View>
      ) : null}

      {/* Recently added */}
      <SectionHeader
        title="Recently added items"
        onAction={() => router.push({ pathname: '/collection/[id]', params: { id: ALL_CLOTHES_ID } })}
        style={{ marginTop: Spacing.xl }}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.recentRow}>
        {recent.map((it) => (
          <View key={it.id} style={{ width: 96 }}>
            <ItemTile item={it} showMeta onPress={() => router.push({ pathname: '/item/[id]', params: { id: it.id } })} />
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

function buildLooks(items: ClothingItem[]): ClothingItem[][] {
  const byCat = (c: ClothingItem['category']) => items.filter((i) => i.category === c);
  const order: ClothingItem['category'][] = ['Tops', 'Bottoms', 'Outerwear', 'Shoes', 'Bags'];
  const looks: ClothingItem[][] = [];
  for (let k = 0; k < 2; k++) {
    const pieces = order.map((c) => byCat(c)[k]).filter(Boolean) as ClothingItem[];
    if (pieces.length >= 2) looks.push(pieces.slice(0, 4));
  }
  return looks;
}

function todayLabel() {
  return new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function BigCard({ title, emoji, tint, onPress }: { title: string; emoji: string; tint: string; onPress: () => void }) {
  return (
    <Pressable style={{ flex: 1 }} onPress={onPress}>
      <Card tint={tint} style={styles.bigCard}>
        <Txt style={{ fontSize: 22, alignSelf: 'flex-end' }}>{emoji}</Txt>
        <Txt variant="bodyStrong">{title}</Txt>
      </Card>
    </Pressable>
  );
}

function LookCard({ items, onPress }: { items: ClothingItem[]; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <Card shadow style={styles.lookCard}>
        <View style={styles.lookGrid}>
          {items.slice(0, 4).map((it) => (
            <View key={it.id} style={styles.lookCell}>
              {it.photoUri ? (
                <Image source={{ uri: it.photoUri }} style={styles.fill} contentFit="cover" />
              ) : (
                <PlaceholderThumb category={it.category} radius={Radius.sm} glyphSize={24} style={styles.fill} />
              )}
            </View>
          ))}
        </View>
      </Card>
    </Pressable>
  );
}

function Progress({ value, max }: { value: number; max: number }) {
  const pct = Math.max(0, Math.min(1, value / max));
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${pct * 100}%` }]} />
      <Txt variant="caption" color="textMuted" style={styles.progressLabel}>
        {value}/{max}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  onboardHero: {
    marginTop: Spacing.lg,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  unlockCard: { marginTop: Spacing.lg, padding: Spacing.lg },
  unlockCardSlim: { padding: Spacing.md, marginBottom: Spacing.lg },
  unlockRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  bigRow: { flexDirection: 'row', gap: Spacing.md },
  bigCard: { height: 112, padding: Spacing.md, justifyContent: 'space-between' },
  quickRow: { gap: 6, paddingVertical: Spacing.lg },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6, marginBottom: Spacing.md },
  lookRow: { gap: Spacing.md, paddingBottom: 4 },
  lookCard: { width: 150, padding: 10 },
  lookGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  lookCell: { width: '47%', aspectRatio: 1, borderRadius: Radius.sm, overflow: 'hidden', backgroundColor: palette.cloud },
  fill: { width: '100%', height: '100%' },
  recentRow: { gap: Spacing.md, paddingBottom: 4 },
  progressTrack: { height: 8, borderRadius: 4, backgroundColor: palette.mist, overflow: 'hidden', justifyContent: 'center' },
  progressFill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: palette.blue, borderRadius: 4 },
  progressLabel: { position: 'absolute', right: 6 },
});
