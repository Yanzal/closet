import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Txt } from '@/components/ui/text';
import { palette } from '@/constants/theme';

/** Circular icon button with a caption below (Home stylist tiles, Closet quick actions). */
export function QuickAction({
  icon,
  label,
  onPress,
  size = 54,
  bg = palette.cloud,
}: {
  icon: ReactNode;
  label: string;
  onPress?: () => void;
  size?: number;
  bg?: string;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.wrap, pressed ? { opacity: 0.7 } : null]}>
      <View
        style={[
          styles.circle,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: bg },
        ]}>
        {icon}
      </View>
      <Txt variant="caption" color="textSecondary" numberOfLines={1}>
        {label}
      </Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 8, width: 70 },
  circle: { alignItems: 'center', justifyContent: 'center' },
});
