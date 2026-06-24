import { type ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { palette, Radius, Spacing } from '@/constants/theme';
import { Txt } from './text';

export function Chip({
  label,
  selected = false,
  onPress,
  leading,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  leading?: ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected ? styles.on : styles.off,
        pressed ? { opacity: 0.8 } : null,
      ]}>
      {leading}
      <Txt variant="label" color={selected ? 'onPrimary' : 'textSecondary'}>
        {label}
      </Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: Radius.pill,
  },
  on: { backgroundColor: palette.black },
  off: { backgroundColor: palette.cloud },
});
