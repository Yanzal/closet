import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ItemTile } from '@/components/item-tile';
import { BackTitle } from '@/components/sub-header';
import { TopBar } from '@/components/top-bar';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Grid } from '@/components/ui/grid';
import { Ionicons } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { Txt } from '@/components/ui/text';
import { palette, Spacing } from '@/constants/theme';
import { REVIEW_DIMENSIONS } from '@/lib/attributes';
import { colorHex } from '@/lib/categories';
import { isOwned } from '@/lib/owned';
import type { ClothingItem } from '@/lib/types';
import { useCloset } from '@/store/closet';

export default function ReviewDimScreen() {
  const { dim } = useLocalSearchParams<{ dim: string }>();
  const router = useRouter();
  const items = useCloset((s) => s.items);
  const updateItem = useCloset((s) => s.updateItem);
  const config = REVIEW_DIMENSIONS.find((d) => d.key === dim);

  const [values, setValues] = useState<string[]>([]);
  const [sel, setSel] = useState<string[]>([]);

  if (!config) {
    return (
      <Screen header={<TopBar left={<BackTitle title="Review" onBack={() => router.back()} />} />}>
        <Txt color="textSecondary">Unknown review step.</Txt>
      </Screen>
    );
  }

  const owned = items.filter(isOwned);
  const toggleVal = (o: string) =>
    config.multi ? setValues((p) => (p.includes(o) ? p.filter((x) => x !== o) : [...p, o])) : setValues([o]);
  const toggleItem = (id: string) => setSel((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const allSelected = sel.length === owned.length && owned.length > 0;

  const apply = () => {
    const value = config.multi ? values : values[0];
    sel.forEach((id) => updateItem(id, { [config.key]: value } as Partial<ClothingItem>));
    router.back();
  };

  return (
    <Screen header={<TopBar left={<BackTitle title={config.label} onBack={() => router.back()} />} />} scroll>
      <Txt variant="h2">Select an option</Txt>
      <View style={styles.chips}>
        {config.options.map((o) => (
          <Chip
            key={o}
            label={o}
            selected={values.includes(o)}
            leading={config.key === 'colors' ? <View style={[styles.dot, { backgroundColor: colorHex(o) }]} /> : undefined}
            onPress={() => toggleVal(o)}
          />
        ))}
      </View>

      <View style={styles.selRow}>
        <Txt variant="label" color="textSecondary">Apply to {sel.length} item{sel.length === 1 ? '' : 's'}</Txt>
        <Pressable onPress={() => setSel(allSelected ? [] : owned.map((i) => i.id))}>
          <Txt variant="small" color="accent">{allSelected ? 'Clear' : 'Select all'}</Txt>
        </Pressable>
      </View>

      <Grid
        numColumns={3}
        gap={10}
        data={owned}
        keyExtractor={(it) => it.id}
        renderItem={(it) => {
          const on = sel.includes(it.id);
          return (
            <View>
              <ItemTile item={it} showMeta onPress={() => toggleItem(it.id)} />
              {on ? (
                <View style={styles.check} pointerEvents="none">
                  <Ionicons name="checkmark-circle" size={24} color={palette.blue} />
                </View>
              ) : null}
            </View>
          );
        }}
      />

      <Button
        title="Apply"
        onPress={apply}
        disabled={values.length === 0 || sel.length === 0}
        style={{ marginTop: Spacing.lg }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: Spacing.md, marginBottom: Spacing.lg },
  dot: { width: 12, height: 12, borderRadius: 6, borderWidth: 1, borderColor: palette.hairline },
  selRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm },
  check: { position: 'absolute', top: 6, right: 6, backgroundColor: palette.white, borderRadius: 12 },
});
