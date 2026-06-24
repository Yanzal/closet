import { type ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { palette, Radius, Spacing } from '@/constants/theme';
import { Txt } from './text';

type Variant = 'primary' | 'secondary' | 'ghost';

export function Button({
  title,
  onPress,
  variant = 'primary',
  leftIcon,
  loading = false,
  disabled = false,
  full = true,
  compact = false,
  style,
}: {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  leftIcon?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  full?: boolean;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const bg =
    variant === 'primary' ? palette.black : variant === 'secondary' ? palette.cloud : palette.white;
  const fg = variant === 'primary' ? 'onPrimary' : 'text';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        compact ? styles.compact : styles.cta,
        full ? { alignSelf: 'stretch' } : null,
        { backgroundColor: bg },
        variant === 'ghost' ? { borderWidth: 1, borderColor: palette.hairline } : null,
        disabled || loading ? { opacity: 0.5 } : null,
        pressed ? { opacity: 0.85 } : null,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : palette.ink} />
      ) : (
        <>
          {leftIcon}
          <Txt variant="bodyStrong" color={fg}>
            {title}
          </Txt>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.pill,
  },
  cta: { paddingVertical: 15, paddingHorizontal: Spacing.xxl },
  compact: { paddingVertical: 9, paddingHorizontal: 18 },
});
