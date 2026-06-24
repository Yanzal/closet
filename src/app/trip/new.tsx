import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { TopBar } from '@/components/top-bar';
import { Button } from '@/components/ui/button';
import { Ionicons } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/icon-button';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { Txt } from '@/components/ui/text';
import { palette, Spacing } from '@/constants/theme';
import { addDaysKey, todayKey } from '@/lib/date';
import { COVER_PRESETS } from '@/lib/covers';
import { useCloset } from '@/store/closet';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export default function NewTripScreen() {
  const router = useRouter();
  const addTrip = useCloset((s) => s.addTrip);

  const [title, setTitle] = useState('');
  const [city, setCity] = useState('');
  const [start, setStart] = useState(todayKey());
  const [end, setEnd] = useState(addDaysKey(todayKey(), 2));
  const [note, setNote] = useState('');
  const [cover, setCover] = useState('signpost');

  const save = () => {
    if (!title.trim()) return Alert.alert('Add a title for your trip');
    if (!city.trim()) return Alert.alert('Add a destination city');
    if (!DATE_RE.test(start) || !DATE_RE.test(end)) return Alert.alert('Dates must be YYYY-MM-DD');
    if (end < start) return Alert.alert('End date is before the start date');
    const id = addTrip({
      title: title.trim(),
      city: city.trim(),
      startDate: start,
      endDate: end,
      note: note.trim() || undefined,
      heroUri: cover,
    });
    router.replace({ pathname: '/trip/[id]', params: { id } });
  };

  const header = (
    <TopBar
      left={
        <IconButton onPress={() => router.back()} style={{ marginLeft: -8 }}>
          <Ionicons name="close" size={26} color={palette.ink} />
        </IconButton>
      }
      right={<Button title="Save" compact full={false} onPress={save} />}
    />
  );

  return (
    <Screen header={header}>
      <Stack.Screen options={{ presentation: 'modal', headerShown: false }} />
      <Txt variant="h2">New trip</Txt>

      <Field label="Title">
        <Input placeholder="e.g. Tokyo trip" value={title} onChangeText={setTitle} autoCapitalize="words" />
      </Field>
      <Field label="Destination city">
        <Input placeholder="e.g. Tokyo" value={city} onChangeText={setCity} autoCapitalize="words" />
      </Field>
      <View style={{ flexDirection: 'row', gap: Spacing.md }}>
        <View style={{ flex: 1 }}>
          <Field label="Start">
            <Input placeholder="YYYY-MM-DD" value={start} onChangeText={setStart} autoCapitalize="none" />
          </Field>
        </View>
        <View style={{ flex: 1 }}>
          <Field label="End">
            <Input placeholder="YYYY-MM-DD" value={end} onChangeText={setEnd} autoCapitalize="none" />
          </Field>
        </View>
      </View>
      <Field label="Note">
        <Input placeholder="Anything to remember…" value={note} onChangeText={setNote} />
      </Field>

      <Field label="Cover">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
          {COVER_PRESETS.map((c) => (
            <Pressable
              key={c.id}
              onPress={() => setCover(c.id)}
              style={[styles.cover, { backgroundColor: c.color }, cover === c.id ? styles.coverOn : null]}>
              <Txt style={{ fontSize: 26 }}>{c.emoji}</Txt>
            </Pressable>
          ))}
        </ScrollView>
      </Field>

      <Button title="Create trip" onPress={save} style={{ marginTop: Spacing.xxl }} />
    </Screen>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Txt variant="label" color="textSecondary">
        {label}
      </Txt>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 8, marginTop: Spacing.lg },
  cover: { width: 64, height: 64, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  coverOn: { borderColor: palette.ink },
});
