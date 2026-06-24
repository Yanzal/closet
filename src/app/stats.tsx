import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { PlaceholderThumb } from '@/components/placeholder-thumb';
import { BackTitle } from '@/components/sub-header';
import { TopBar } from '@/components/top-bar';
import { Ionicons } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { Txt } from '@/components/ui/text';
import { UnderlineTabs } from '@/components/ui/underline-tabs';
import { palette, Radius, Spacing } from '@/constants/theme';
import { isOwned } from '@/lib/owned';
import type { ClothingItem } from '@/lib/types';
import { useCloset } from '@/store/closet';

type Tab = 'Item' | 'Outfit' | 'Purchase';

function countBy(values: (string | undefined)[]): { label: string; count: number }[] {
  const m: Record<string, number> = {};
  values.forEach((v) => {
    if (v) m[v] = (m[v] ?? 0) + 1;
  });
  return Object.entries(m)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

export default function StatsScreen() {
  const router = useRouter();
  const items = useCloset((s) => s.items);
  const outfits = useCloset((s) => s.outfits);
  const calendar = useCloset((s) => s.calendar);
  const currency = useCloset((s) => s.settings.currency);
  const [tab, setTab] = useState<Tab>('Item');

  const d = useMemo(() => {
    const owned = items.filter(isOwned);
    const worn = [...owned].sort((a, b) => b.wearCount - a.wearCount);
    const neverWorn = owned.filter((i) => i.wearCount === 0);
    const value = owned.reduce((s, i) => s + (i.price || 0), 0);
    const costPerWear = owned
      .filter((i) => (i.price ?? 0) > 0 && i.wearCount > 0)
      .map((i) => ({ item: i, cpw: (i.price as number) / i.wearCount }))
      .sort((a, b) => a.cpw - b.cpw);

    const byCategory = countBy(owned.map((i) => i.category));
    const byColor = countBy(owned.flatMap((i) => i.colors));
    const byOccasion = countBy(owned.flatMap((i) => i.occasions ?? []));
    const bySeason = countBy(owned.flatMap((i) => i.seasons));
    const byBrand = countBy(owned.map((i) => i.brand));

    // monthly purchases
    const byMonth: Record<string, { count: number; spend: number }> = {};
    owned.forEach((i) => {
      const m = i.dateAdded.slice(0, 7);
      byMonth[m] = byMonth[m] ?? { count: 0, spend: 0 };
      byMonth[m].count += 1;
      byMonth[m].spend += i.price || 0;
    });
    const months = Object.entries(byMonth).sort((a, b) => (a[0] < b[0] ? 1 : -1)).slice(0, 6);

    const outfitSeason = countBy(outfits.map((o) => o.season));
    const outfitStyle = countBy(outfits.map((o) => o.style));
    const outfitOccasion = countBy(outfits.map((o) => o.occasion));

    return { owned, worn, neverWorn, value, costPerWear, byCategory, byColor, byOccasion, bySeason, byBrand, months, outfitSeason, outfitStyle, outfitOccasion };
  }, [items, outfits]);

  return (
    <Screen header={<TopBar left={<BackTitle title="Style stats" onBack={() => router.back()} />} />}>
      <View style={styles.summary}>
        <Summary label="Item" value={d.owned.length} />
        <Summary label="Outfit" value={outfits.length} />
        <Summary label="Looks logged" value={calendar.length} />
      </View>

      <View style={{ marginTop: Spacing.lg, marginBottom: Spacing.sm }}>
        <UnderlineTabs tabs={['Item', 'Outfit', 'Purchase']} value={tab} onChange={setTab} />
      </View>

      {tab === 'Item' ? (
        <View style={{ gap: Spacing.lg }}>
          <Bars title="By category" data={d.byCategory} />
          <Bars title="By color" data={d.byColor} />
          {d.byOccasion.length ? <Bars title="By occasion" data={d.byOccasion} /> : null}
          <Bars title="By season" data={d.bySeason} />

          <Section title="Worn the most" />
          <Card>
            {d.worn.slice(0, 3).map((it, i) => (
              <ItemRow key={it.id} item={it} rank={i + 1} right={`${it.wearCount}×`} onPress={() => router.push({ pathname: '/item/[id]', params: { id: it.id } })} />
            ))}
            {d.worn.length === 0 ? <Empty text="No items yet." /> : null}
          </Card>

          <Section title="Gathering dust" hint={`${d.neverWorn.length} not worn yet`} />
          <Card>
            {d.neverWorn.length === 0 ? (
              <Empty text="Great — everything's been worn!" />
            ) : (
              d.neverWorn.slice(0, 4).map((it) => (
                <ItemRow key={it.id} item={it} right="never" onPress={() => router.push({ pathname: '/item/[id]', params: { id: it.id } })} />
              ))
            )}
          </Card>

          <Section title="Best value (cost per wear)" />
          <Card>
            {d.costPerWear.length === 0 ? (
              <Empty text="Add prices and log wears to see cost per wear." />
            ) : (
              d.costPerWear.slice(0, 5).map(({ item, cpw }, i) => (
                <ItemRow key={item.id} item={item} rank={i + 1} right={`${currency}${cpw.toFixed(2)}/wear`} sub={`${item.wearCount}× · ${currency}${item.price}`} onPress={() => router.push({ pathname: '/item/[id]', params: { id: item.id } })} />
              ))
            )}
          </Card>

          <View style={styles.valueCard}>
            <View>
              <Txt variant="small" color="textMuted">Closet value</Txt>
              <Txt variant="h1" color="accent">{currency}{d.value}</Txt>
            </View>
            <Ionicons name="pricetags-outline" size={28} color={palette.silver} />
          </View>
        </View>
      ) : tab === 'Outfit' ? (
        <View style={{ gap: Spacing.lg }}>
          {outfits.length === 0 ? (
            <Empty text="Create outfits to see outfit stats." />
          ) : (
            <>
              {d.outfitSeason.length ? <Bars title="By season" data={d.outfitSeason} /> : null}
              {d.outfitStyle.length ? <Bars title="By style" data={d.outfitStyle} /> : null}
              {d.outfitOccasion.length ? <Bars title="By occasion" data={d.outfitOccasion} /> : null}
              {!d.outfitSeason.length && !d.outfitStyle.length && !d.outfitOccasion.length ? (
                <Empty text="Tag your outfits (season, style, occasion) to see breakdowns." />
              ) : null}
            </>
          )}
        </View>
      ) : (
        <View style={{ gap: Spacing.lg }}>
          <Section title="Monthly purchases" />
          <Card>
            {d.months.length === 0 ? (
              <Empty text="No purchases yet." />
            ) : (
              d.months.map(([m, v]) => (
                <View key={m} style={styles.monthRow}>
                  <Txt variant="body">{formatMonth(m)}</Txt>
                  <Txt variant="bodyStrong" color="accent">{currency}{v.spend} · {v.count} item{v.count === 1 ? '' : 's'}</Txt>
                </View>
              ))
            )}
          </Card>
          <View style={styles.valueCard}>
            <View>
              <Txt variant="small" color="textMuted">Total spent</Txt>
              <Txt variant="h1" color="accent">{currency}{d.value}</Txt>
            </View>
            <Ionicons name="wallet-outline" size={28} color={palette.silver} />
          </View>
        </View>
      )}
    </Screen>
  );
}

function formatMonth(m: string) {
  const [y, mo] = m.split('-').map(Number);
  return new Date(y, mo - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

function Summary({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.summaryCard}>
      <Txt variant="small" color="textMuted">{label}</Txt>
      <Txt variant="h1" color="accent">{value}</Txt>
    </View>
  );
}

function Section({ title, hint }: { title: string; hint?: string }) {
  return (
    <View style={styles.sectionHead}>
      <Txt variant="title">{title}</Txt>
      {hint ? <Txt variant="small" color="textMuted">{hint}</Txt> : null}
    </View>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

function Empty({ text }: { text: string }) {
  return <Txt variant="small" color="textMuted" style={{ paddingVertical: 6 }}>{text}</Txt>;
}

function Bars({ title, data }: { title: string; data: { label: string; count: number }[] }) {
  const max = Math.max(1, ...data.map((x) => x.count));
  return (
    <View>
      <Txt variant="title" style={{ marginBottom: Spacing.sm }}>{title}</Txt>
      <View style={styles.card}>
        {data.slice(0, 6).map((x) => (
          <View key={x.label} style={styles.barRow}>
            <Txt variant="small" style={{ width: 92 }} numberOfLines={1}>{x.label}</Txt>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${(x.count / max) * 100}%` }]} />
            </View>
            <Txt variant="small" color="textMuted" style={{ width: 22, textAlign: 'right' }}>{x.count}</Txt>
          </View>
        ))}
      </View>
    </View>
  );
}

function ItemRow({ item, right, sub, rank, onPress }: { item: ClothingItem; right: string; sub?: string; rank?: number; onPress?: () => void }) {
  return (
    <Pressable style={styles.itemRow} onPress={onPress}>
      {rank ? (
        <View style={styles.rank}><Txt variant="caption" color="onPrimary">{rank}</Txt></View>
      ) : null}
      <View style={styles.rowThumb}>
        {item.photoUri ? (
          <Image source={{ uri: item.photoUri }} style={styles.fill} contentFit="cover" />
        ) : (
          <PlaceholderThumb category={item.category} radius={8} glyphSize={18} style={styles.fill} />
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Txt variant="small" numberOfLines={1}>{item.name}</Txt>
        {sub ? <Txt variant="caption" color="textMuted">{sub}</Txt> : null}
      </View>
      <Txt variant="bodyStrong" color="accent">{right}</Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  summary: { flexDirection: 'row', gap: Spacing.md },
  summaryCard: { flex: 1, backgroundColor: palette.cloud, borderRadius: Radius.lg, paddingVertical: Spacing.md, alignItems: 'center', gap: 2 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  card: { borderWidth: 1, borderColor: palette.hairline, borderRadius: Radius.lg, padding: Spacing.md, gap: 10, marginTop: Spacing.sm },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barTrack: { flex: 1, height: 8, borderRadius: 4, backgroundColor: palette.mist, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: palette.blue, borderRadius: 4 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rank: { width: 20, height: 20, borderRadius: 10, backgroundColor: palette.black, alignItems: 'center', justifyContent: 'center' },
  rowThumb: { width: 38, height: 38, borderRadius: 8, overflow: 'hidden', backgroundColor: palette.cloud },
  fill: { width: '100%', height: '100%' },
  valueCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: palette.hairline, borderRadius: Radius.lg, padding: Spacing.lg },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
