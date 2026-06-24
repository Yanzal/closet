import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { palette, Spacing } from '@/constants/theme';
import { Txt } from './text';

/** Horizontal text tabs with an underline indicator (e.g. All / Tops / Bottoms). */
export function UnderlineTabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: T[];
  value: T;
  onChange: (t: T) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}>
      {tabs.map((t) => {
        const active = t === value;
        return (
          <Pressable key={t} onPress={() => onChange(t)} style={styles.tab}>
            <Txt variant={active ? 'bodyStrong' : 'body'} color={active ? 'text' : 'textMuted'}>
              {t}
            </Txt>
            <View style={[styles.bar, active ? styles.barOn : null]} />
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: Spacing.xl, paddingRight: Spacing.lg },
  tab: { alignItems: 'center', gap: 8, paddingTop: 2 },
  bar: { height: 2, borderRadius: 2, width: '100%', backgroundColor: 'transparent' },
  barOn: { backgroundColor: palette.ink },
});
