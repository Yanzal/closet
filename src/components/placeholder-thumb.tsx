import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Radius } from '@/constants/theme';
import { categoryMeta } from '@/lib/categories';
import type { Category } from '@/lib/types';

/** Tinted tile with a category emoji — shown for items that have no photo (e.g. seed data). */
export function PlaceholderThumb({
  category,
  style,
  radius = Radius.md,
  glyphSize = 40,
}: {
  category: Category;
  style?: StyleProp<ViewStyle>;
  radius?: number;
  glyphSize?: number;
}) {
  const meta = categoryMeta(category);
  return (
    <View style={[styles.box, { backgroundColor: meta.tint, borderRadius: radius }, style]}>
      <Text style={{ fontSize: glyphSize }}>{meta.emoji}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
});
