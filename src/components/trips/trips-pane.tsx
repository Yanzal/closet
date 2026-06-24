import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Ionicons } from '@/components/ui/icon';
import { Txt } from '@/components/ui/text';
import { palette, Radius, Spacing } from '@/constants/theme';
import { coverOf } from '@/lib/covers';
import { fmtRange } from '@/lib/date';
import { useCloset } from '@/store/closet';

export function TripsPane() {
  const router = useRouter();
  const trips = useCloset((s) => s.trips);

  return (
    <View>
      <Button
        title="New trip"
        leftIcon={<Ionicons name="add" size={18} color="#fff" />}
        onPress={() => router.push('/trip/new')}
        style={{ marginBottom: Spacing.lg }}
      />

      {trips.length === 0 ? (
        <Card style={styles.empty}>
          <Txt style={{ fontSize: 40 }}>🧳</Txt>
          <Txt variant="title">Plan a trip</Txt>
          <Txt variant="small" color="textMuted" style={{ textAlign: 'center' }}>
            Add a destination and dates — we&apos;ll pull the forecast and help you pack.
          </Txt>
        </Card>
      ) : (
        <View style={{ gap: Spacing.md }}>
          {trips.map((t) => (
            <Pressable
              key={t.id}
              onPress={() => router.push({ pathname: '/trip/[id]', params: { id: t.id } })}
              style={({ pressed }) => (pressed ? { opacity: 0.85 } : null)}>
              <Card style={styles.card} bordered={false} tint={coverOf(t.heroUri).color}>
                <Txt style={{ fontSize: 26 }}>{coverOf(t.heroUri).emoji}</Txt>
                <Txt variant="title" color="onPrimary">{t.title}</Txt>
                <View style={styles.metaRow}>
                  <Ionicons name="calendar-outline" size={14} color={palette.silver} />
                  <Txt variant="small" style={{ color: palette.silver }}>{fmtRange(t.startDate, t.endDate)}</Txt>
                  <Ionicons name="location-outline" size={14} color={palette.silver} style={{ marginLeft: 8 }} />
                  <Txt variant="small" style={{ color: palette.silver }}>{t.city}</Txt>
                </View>
              </Card>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: 'center', gap: 10, paddingVertical: Spacing.six, paddingHorizontal: Spacing.lg },
  card: { padding: Spacing.lg, gap: 6, borderRadius: Radius.xl },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
});
