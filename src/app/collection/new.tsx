import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { ItemTile } from '@/components/item-tile';
import { TopBar } from '@/components/top-bar';
import { Button } from '@/components/ui/button';
import { Grid } from '@/components/ui/grid';
import { Ionicons } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/icon-button';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { Txt } from '@/components/ui/text';
import { palette, Spacing } from '@/constants/theme';
import { useCloset } from '@/store/closet';

export default function NewCollectionScreen() {
  const router = useRouter();
  const items = useCloset((s) => s.items);
  const addCollection = useCloset((s) => s.addCollection);
  const setCollectionItems = useCloset((s) => s.setCollectionItems);

  const [name, setName] = useState('');
  const [sel, setSel] = useState<string[]>([]);

  const toggle = (id: string) =>
    setSel((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const save = () => {
    if (!name.trim()) return Alert.alert('Name your closet', 'Give your closet a name first.');
    const id = addCollection(name.trim());
    if (sel.length) setCollectionItems(id, sel);
    router.replace({ pathname: '/collection/[id]', params: { id } });
  };

  const header = (
    <TopBar
      left={
        <IconButton onPress={() => router.back()} style={{ marginLeft: -8 }}>
          <Ionicons name="close" size={26} color={palette.ink} />
        </IconButton>
      }
      right={<Button title="Create" compact full={false} onPress={save} />}
    />
  );

  return (
    <Screen header={header}>
      <Stack.Screen options={{ presentation: 'modal', headerShown: false }} />
      <Txt variant="h2">New closet</Txt>

      <View style={{ gap: 8, marginTop: Spacing.lg }}>
        <Txt variant="label" color="textSecondary">Name</Txt>
        <Input placeholder="e.g. Work, Summer, Gym" value={name} onChangeText={setName} autoCapitalize="words" />
      </View>

      <View style={styles.addRow}>
        <Txt variant="label" color="textSecondary">Add items</Txt>
        <Txt variant="small" color="textMuted">{sel.length} selected</Txt>
      </View>

      <Grid
        numColumns={3}
        gap={10}
        data={items}
        keyExtractor={(it) => it.id}
        renderItem={(it) => {
          const on = sel.includes(it.id);
          return (
            <View>
              <ItemTile item={it} showMeta onPress={() => toggle(it.id)} />
              {on ? (
                <View style={styles.check} pointerEvents="none">
                  <Ionicons name="checkmark-circle" size={24} color={palette.blue} />
                </View>
              ) : null}
            </View>
          );
        }}
      />

      {items.length === 0 ? (
        <Txt variant="small" color="textMuted">Add items to your closet first, then group them here.</Txt>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  addRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  check: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: palette.white,
    borderRadius: 12,
  },
});
