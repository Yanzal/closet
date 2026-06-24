import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ItemTile } from '@/components/item-tile';
import { BackTitle } from '@/components/sub-header';
import { TopBar } from '@/components/top-bar';
import { Button } from '@/components/ui/button';
import { Grid } from '@/components/ui/grid';
import { Ionicons } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { Txt } from '@/components/ui/text';
import { palette, Radius, Spacing } from '@/constants/theme';
import { isOwned } from '@/lib/owned';
import { useCloset } from '@/store/closet';

export default function TryOnScreen() {
  const router = useRouter();
  const items = useCloset((s) => s.items);
  const owned = items.filter(isOwned);

  const [photo, setPhoto] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);

  const pickPhoto = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.9 });
    if (!res.canceled && res.assets?.[0]) setPhoto(res.assets[0].uri);
  };
  const toggle = (id: string) =>
    setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const tryOn = () =>
    Alert.alert(
      'Virtual try-on',
      'On-model try-on is coming soon — it needs an AI try-on service we haven’t connected yet. Your photo and picks are ready for when it lands.',
    );

  const header = <TopBar left={<BackTitle title="Try On" onBack={() => router.back()} />} />;

  return (
    <Screen header={header} scroll={false} bottomInset={false}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <Pressable style={styles.photoBox} onPress={pickPhoto}>
          {photo ? (
            <Image source={{ uri: photo }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
          ) : (
            <View style={{ alignItems: 'center', gap: 12 }}>
              <Txt variant="body" color="textMuted">Add your full-body photo</Txt>
              <View style={styles.plus}>
                <Ionicons name="add" size={28} color={palette.gray} />
              </View>
            </View>
          )}
        </Pressable>

        <Txt variant="title" style={{ marginTop: Spacing.xl, marginBottom: Spacing.md }}>
          Select items to Try On
        </Txt>
        {owned.length === 0 ? (
          <Txt variant="small" color="textMuted">Add some items to your closet first.</Txt>
        ) : (
          <Grid
            numColumns={4}
            gap={8}
            data={owned}
            keyExtractor={(it) => it.id}
            renderItem={(it) => (
              <View style={selected.includes(it.id) ? styles.picked : undefined}>
                <ItemTile item={it} onPress={() => toggle(it.id)} />
              </View>
            )}
          />
        )}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.creditRow}>
          <Txt variant="small" color="textMuted">🫘 First use free</Txt>
        </View>
        <Button title="Try On" onPress={tryOn} disabled={!photo || selected.length === 0} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  photoBox: {
    height: 320,
    borderRadius: Radius.xl,
    backgroundColor: palette.cloud,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  plus: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: palette.silver,
    alignItems: 'center',
    justifyContent: 'center',
  },
  picked: { borderWidth: 2, borderColor: palette.blue, borderRadius: Radius.md },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    backgroundColor: palette.white,
    borderTopWidth: 1,
    borderTopColor: palette.hairline,
    gap: Spacing.sm,
  },
  creditRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
