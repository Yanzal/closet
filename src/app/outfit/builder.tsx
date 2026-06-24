import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, LayoutChangeEvent, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { DraggableItem } from '@/components/outfit/draggable-item';
import { ItemTile } from '@/components/item-tile';
import { Button } from '@/components/ui/button';
import { Grid } from '@/components/ui/grid';
import { Ionicons } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/icon-button';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { Txt } from '@/components/ui/text';
import { UnderlineTabs } from '@/components/ui/underline-tabs';
import { palette, Radius, Spacing } from '@/constants/theme';
import { buildLookNodes, suggestOutfit } from '@/lib/ai/stylist';
import { CATEGORY_KEYS } from '@/lib/categories';
import { fmtDayShort, todayKey } from '@/lib/date';
import { uid } from '@/lib/id';
import { DayWeather, geocodeCity, getDailyForecast, weatherInfo } from '@/lib/weather';
import type { Category, ClothingItem, PlacedNode } from '@/lib/types';
import { useCloset } from '@/store/closet';

type CatTab = 'All' | Category;
const MIN_SCALE = 0.4;
const MAX_SCALE = 2.6;

export default function OutfitBuilderScreen() {
  const router = useRouter();
  const { id, mode } = useLocalSearchParams<{ id?: string; mode?: string }>();
  const items = useCloset((s) => s.items);
  const outfits = useCloset((s) => s.outfits);
  const addOutfit = useCloset((s) => s.addOutfit);
  const updateOutfit = useCloset((s) => s.updateOutfit);
  const homeCity = useCloset((s) => s.settings.homeCity);
  const tempUnit = useCloset((s) => s.settings.tempUnit);
  const [weather, setWeather] = useState<DayWeather | null>(null);

  const editing = outfits.find((o) => o.id === id);
  const [nodes, setNodes] = useState<PlacedNode[]>(editing ? editing.nodes : []);
  const [name, setName] = useState(editing ? editing.name : '');
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [canvas, setCanvas] = useState({ w: 0, h: 0 });
  const [cat, setCat] = useState<CatTab>('All');

  const trayItems = useMemo(
    () => (cat === 'All' ? items : items.filter((i) => i.category === cat)),
    [items, cat],
  );
  const selected = nodes.find((n) => n.key === selectedKey) ?? null;

  useEffect(() => {
    if (!homeCity) {
      setWeather(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const geo = await geocodeCity(homeCity);
      if (!geo) return;
      const today = todayKey();
      const days = await getDailyForecast(geo.latitude, geo.longitude, today, today);
      if (!cancelled && days[0]) setWeather(days[0]);
    })();
    return () => {
      cancelled = true;
    };
  }, [homeCity]);

  // "Acloset Layout" mode: pre-fill the canvas with a neatly-arranged suggested look.
  useEffect(() => {
    if (mode === 'layout' && !editing && nodes.length === 0 && items.length > 0) {
      const look = suggestOutfit(items, 'mild');
      if (look.length) setNodes(buildLookNodes(look));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, items.length]);

  const toUnit = (c: number) => (tempUnit === 'F' ? Math.round((c * 9) / 5 + 32) : c);

  const onCanvasLayout = (e: LayoutChangeEvent) =>
    setCanvas({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height });

  const addNode = (item: ClothingItem) => {
    const key = uid('nd_');
    setNodes((ns) => {
      // Offset each new item in a loose grid so they don't stack on top of each other.
      const n = ns.length;
      const cx = 0.5 + (((n % 3) - 1) * 0.14);
      const cy = 0.4 + ((Math.floor(n / 3) % 3) * 0.16);
      return [...ns, { key, itemId: item.id, cx, cy, scale: 1 }];
    });
    setSelectedKey(key);
  };
  const moveNode = (key: string, cx: number, cy: number) =>
    setNodes((ns) => ns.map((n) => (n.key === key ? { ...n, cx, cy } : n)));
  const scaleSelected = (factor: number) =>
    setNodes((ns) =>
      ns.map((n) =>
        n.key === selectedKey
          ? { ...n, scale: Math.min(MAX_SCALE, Math.max(MIN_SCALE, n.scale * factor)) }
          : n,
      ),
    );
  const bringFront = () =>
    setNodes((ns) => {
      const i = ns.findIndex((n) => n.key === selectedKey);
      if (i < 0) return ns;
      const copy = [...ns];
      const [n] = copy.splice(i, 1);
      copy.push(n);
      return copy;
    });
  const deleteSelected = () => {
    setNodes((ns) => ns.filter((n) => n.key !== selectedKey));
    setSelectedKey(null);
  };

  const save = () => {
    if (nodes.length === 0) {
      Alert.alert('Add some items', 'Tap items below to add them to your outfit first.');
      return;
    }
    const finalName = name.trim() || `Outfit ${outfits.length + 1}`;
    const itemIds = [...new Set(nodes.map((n) => n.itemId))];
    if (editing) updateOutfit(editing.id, { name: finalName, nodes, itemIds });
    else addOutfit({ name: finalName, nodes });
    router.back();
  };

  const header = (
    <View style={styles.header}>
      <IconButton onPress={() => router.back()} style={{ marginLeft: -8 }}>
        <Ionicons name="close" size={26} color={palette.ink} />
      </IconButton>
      <Txt variant="title">{editing ? 'Edit outfit' : 'New outfit'}</Txt>
      <Button title="Save" compact full={false} onPress={save} />
    </View>
  );

  return (
    <Screen scroll={false} bottomInset={false} header={header} padded={false}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.nameRow}>
        <Input placeholder="Name your outfit" value={name} onChangeText={setName} />
      </View>

      <View style={styles.weatherRow}>
        <Ionicons name="calendar-outline" size={14} color={palette.gray} />
        <Txt variant="small" color="textSecondary">{fmtDayShort(todayKey())}</Txt>
        <Txt variant="small" color="textMuted">·</Txt>
        {homeCity ? (
          weather ? (
            <Txt variant="small">
              {weatherInfo(weather.code).emoji} {toUnit(weather.tMax)}° / {toUnit(weather.tMin)}°
            </Txt>
          ) : (
            <Txt variant="small" color="textMuted">{homeCity}</Txt>
          )
        ) : (
          <Pressable onPress={() => router.push('/profile')}>
            <Txt variant="small" color="accent">Set your city</Txt>
          </Pressable>
        )}
      </View>

      {/* Canvas */}
      <Pressable style={styles.canvas} onLayout={onCanvasLayout} onPress={() => setSelectedKey(null)}>
        {canvas.w > 0 &&
          nodes.map((n) => {
            const item = items.find((i) => i.id === n.itemId);
            if (!item) return null;
            return (
              <DraggableItem
                key={n.key}
                item={item}
                node={n}
                canvasW={canvas.w}
                canvasH={canvas.h}
                selected={n.key === selectedKey}
                onSelect={setSelectedKey}
                onMove={moveNode}
              />
            );
          })}
        {nodes.length === 0 ? (
          <View style={styles.canvasEmpty} pointerEvents="none">
            <Ionicons name="shirt-outline" size={30} color={palette.silver} />
            <Txt variant="small" color="textMuted">Tap items below to build your look</Txt>
          </View>
        ) : null}
      </Pressable>

      {/* Selection toolbar */}
      <View style={styles.toolbar}>
        <ToolBtn icon="remove" disabled={!selected} onPress={() => scaleSelected(0.85)} />
        <ToolBtn icon="add" disabled={!selected} onPress={() => scaleSelected(1.18)} />
        <ToolBtn icon="layers-outline" disabled={!selected} onPress={bringFront} />
        <ToolBtn icon="trash-outline" disabled={!selected} danger onPress={deleteSelected} />
      </View>

      {/* Item tray */}
      <View style={styles.tray}>
        <View style={{ paddingHorizontal: Spacing.lg }}>
          <UnderlineTabs tabs={['All', ...CATEGORY_KEYS]} value={cat} onChange={setCat} />
        </View>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.trayContent}>
          <Grid
            numColumns={4}
            gap={8}
            data={trayItems}
            keyExtractor={(it) => it.id}
            renderItem={(it) => <ItemTile item={it} onPress={() => addNode(it)} />}
          />
          {trayItems.length === 0 ? (
            <Txt variant="small" color="textMuted">No items here yet — add some from the closet.</Txt>
          ) : null}
        </ScrollView>
      </View>
    </Screen>
  );
}

function ToolBtn({
  icon,
  onPress,
  disabled,
  danger,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.toolBtn,
        disabled ? { opacity: 0.3 } : null,
        pressed ? { opacity: 0.6 } : null,
      ]}>
      <Ionicons name={icon} size={20} color={danger ? palette.danger : palette.ink} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  nameRow: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm },
  weatherRow: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm },
  canvas: {
    flex: 1,
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.xl,
    backgroundColor: palette.cloud,
    borderWidth: 1,
    borderColor: palette.hairline,
    overflow: 'hidden',
  },
  canvasEmpty: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  toolBtn: {
    width: 44,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: palette.cloud,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tray: {
    height: 250,
    borderTopWidth: 1,
    borderTopColor: palette.hairline,
    paddingTop: Spacing.sm,
  },
  trayContent: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg, gap: Spacing.sm },
});
