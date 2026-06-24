import { Pressable, StyleSheet, View } from 'react-native';

import { Ionicons } from '@/components/ui/icon';
import { Txt } from '@/components/ui/text';
import { palette, Spacing } from '@/constants/theme';

/** A tappable "Label … value ⌄" row used on the Item Details Info tab. */
export function AttributeRow({
  label,
  value,
  placeholder = 'Choose',
  required = false,
  onPress,
}: {
  label: string;
  value?: string;
  placeholder?: string;
  required?: boolean;
  onPress?: () => void;
}) {
  const filled = !!value;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed ? { opacity: 0.6 } : null]}>
      <Txt variant="small" color="textMuted">
        {label}
      </Txt>
      <View style={styles.right}>
        <Txt
          variant="bodyStrong"
          color={filled ? 'text' : required ? 'accent' : 'textMuted'}
          numberOfLines={1}
          style={{ flexShrink: 1, textAlign: 'right' }}>
          {filled ? value : placeholder}
        </Txt>
        <Ionicons name="chevron-down" size={16} color={palette.gray} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.lg,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: palette.hairline,
  },
  right: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
});
