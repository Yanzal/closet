import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { palette, Spacing } from '@/constants/theme';
import { Ionicons } from './icon';
import { Txt } from './text';

export function SectionHeader({
  title,
  actionLabel,
  onAction,
  right,
  style,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  right?: ReactNode;
  style?: object;
}) {
  return (
    <View style={[styles.row, style]}>
      <Txt variant="title">{title}</Txt>
      {right ??
        (onAction ? (
          <Pressable onPress={onAction} hitSlop={10} style={styles.action}>
            {actionLabel ? (
              <Txt variant="small" color="textMuted">
                {actionLabel}
              </Txt>
            ) : null}
            <Ionicons name="chevron-forward" size={18} color={palette.gray} />
          </Pressable>
        ) : null)}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  action: { flexDirection: 'row', alignItems: 'center', gap: 2 },
});
