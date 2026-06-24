import type { TabTriggerSlotProps } from 'expo-router/ui';
import { Children, type ReactNode } from 'react';
import { Pressable, StyleSheet, View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Ionicons } from '@/components/ui/icon';
import { Txt } from '@/components/ui/text';
import { MaxContentWidth, palette, Shadow, Spacing, TabBarHeight } from '@/constants/theme';

/**
 * Custom bottom tab bar for expo-router/ui Tabs. Renders the four tab triggers
 * (two on each side) around an elevated black (+) button that opens the Add sheet.
 */
export function TabBar({ children, onAdd, ...props }: ViewProps & { onAdd: () => void }) {
  const insets = useSafeAreaInsets();
  const kids = Children.toArray(children);
  const left = kids.slice(0, 2);
  const right = kids.slice(2);

  return (
    <View style={styles.outer} pointerEvents="box-none">
      <View {...props} style={[styles.bar, { paddingBottom: insets.bottom }]}>
        <View style={styles.row}>
          <View style={styles.side}>{left}</View>
          <Pressable
            onPress={onAdd}
            style={({ pressed }) => [styles.fab, pressed ? { opacity: 0.85 } : null]}>
            <Ionicons name="add" size={30} color="#fff" />
          </Pressable>
          <View style={styles.side}>{right}</View>
        </View>
      </View>
    </View>
  );
}

/** A single tab button; receives press behavior + isFocused from TabTrigger (asChild). */
export function TabItem({
  icon,
  label,
  isFocused,
  ...props
}: TabTriggerSlotProps & { icon: (active: boolean) => ReactNode; label: string }) {
  return (
    <Pressable {...props} style={styles.item}>
      {icon(!!isFocused)}
      <Txt variant="caption" color={isFocused ? 'text' : 'textMuted'}>
        {label}
      </Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outer: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center' },
  bar: {
    width: '100%',
    maxWidth: MaxContentWidth,
    backgroundColor: palette.white,
    borderTopWidth: 1,
    borderTopColor: palette.hairline,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: TabBarHeight,
    paddingHorizontal: Spacing.sm,
  },
  side: { flex: 1, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: palette.black,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
    marginHorizontal: Spacing.sm,
    ...Shadow.float,
  },
  item: { alignItems: 'center', justifyContent: 'center', gap: 3, paddingVertical: 6, flex: 1 },
});
