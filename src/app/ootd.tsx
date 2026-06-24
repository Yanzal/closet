import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { OutfitPreview } from '@/components/outfit/outfit-preview';
import { TopBar } from '@/components/top-bar';
import { Button } from '@/components/ui/button';
import { Ionicons } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/icon-button';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { Txt } from '@/components/ui/text';
import { palette, Radius, Spacing } from '@/constants/theme';
import { fmtDayShort, todayKey } from '@/lib/date';
import { useCloset } from '@/store/closet';

export default function OOTDScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ date?: string }>();
  const outfits = useCloset((s) => s.outfits);
  const items = useCloset((s) => s.items);
  const setCalendarEntry = useCloset((s) => s.setCalendarEntry);

  const [date] = useState(params.date ?? todayKey());
  const [outfitId, setOutfitId] = useState<string | undefined>();
  const [rating, setRating] = useState(0);
  const [label, setLabel] = useState('');
  const [info, setInfo] = useState('');

  const create = () => {
    setCalendarEntry(date, {
      outfitId,
      rating: rating || undefined,
      label: label.trim() || undefined,
      info: info.trim() || undefined,
    });
    router.back();
  };

  const header = (
    <TopBar
      left={
        <IconButton onPress={() => router.back()} style={{ marginLeft: -8 }}>
          <Ionicons name="close" size={26} color={palette.ink} />
        </IconButton>
      }
      right={<Button title="Create" compact full={false} onPress={create} />}
    />
  );

  return (
    <Screen header={header}>
      <Stack.Screen options={{ presentation: 'modal', headerShown: false }} />
      <Txt variant="h2">New OOTD</Txt>
      <View style={styles.dateRow}>
        <Ionicons name="calendar-outline" size={16} color={palette.gray} />
        <Txt variant="small" color="textSecondary">{fmtDayShort(date)}</Txt>
      </View>

      <Txt variant="label" color="textSecondary" style={styles.lbl}>Pick an outfit</Txt>
      {outfits.length === 0 ? (
        <Txt variant="small" color="textMuted">No saved outfits — you can still log a rating and note.</Txt>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {outfits.map((o) => (
            <Pressable key={o.id} onPress={() => setOutfitId(outfitId === o.id ? undefined : o.id)}>
              <View style={[styles.thumb, outfitId === o.id ? styles.thumbOn : null]}>
                <OutfitPreview items={items} nodes={o.nodes} size={92} />
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}

      <Txt variant="label" color="textSecondary" style={styles.lbl}>My rating</Txt>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable key={n} onPress={() => setRating(n)} hitSlop={4}>
            <Ionicons name={rating >= n ? 'star' : 'star-outline'} size={28} color={rating >= n ? palette.amber : palette.silver} />
          </Pressable>
        ))}
      </View>

      <Txt variant="label" color="textSecondary" style={styles.lbl}>Label</Txt>
      <Input placeholder="e.g. Work, Brunch" value={label} onChangeText={setLabel} />

      <Txt variant="label" color="textSecondary" style={styles.lbl}>Notes</Txt>
      <Input placeholder="What kind of outfit is it?" value={info} onChangeText={setInfo} />

      <Button title="Create OOTD" onPress={create} style={{ marginTop: Spacing.xxl }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  lbl: { marginTop: Spacing.xl, marginBottom: Spacing.sm },
  row: { gap: Spacing.md, paddingBottom: 4 },
  thumb: { width: 92, height: 92, borderRadius: Radius.md, overflow: 'hidden', borderWidth: 2, borderColor: palette.hairline },
  thumbOn: { borderColor: palette.ink },
});
