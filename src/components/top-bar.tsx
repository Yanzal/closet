import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Ionicons } from '@/components/ui/icon';
import { Txt } from '@/components/ui/text';
import { palette, Spacing } from '@/constants/theme';

/** App header row: a title (optionally with a dropdown caret) on the left, actions on the right. */
export function TopBar({
  title,
  caret = false,
  onTitlePress,
  right,
  left,
}: {
  title?: string;
  caret?: boolean;
  onTitlePress?: () => void;
  right?: ReactNode;
  left?: ReactNode;
}) {
  return (
    <View style={styles.bar}>
      {left ?? (
        <Pressable disabled={!onTitlePress} onPress={onTitlePress} style={styles.titleRow}>
          <Txt variant="h1">{title}</Txt>
          {caret ? <Ionicons name="chevron-down" size={20} color={palette.ink} /> : null}
        </Pressable>
      )}
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    minHeight: 48,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
