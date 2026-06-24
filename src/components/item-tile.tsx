import { Image } from 'expo-image';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { PlaceholderThumb } from '@/components/placeholder-thumb';
import { Txt } from '@/components/ui/text';
import { palette, Radius } from '@/constants/theme';
import type { ClothingItem } from '@/lib/types';

/** Square thumbnail (photo or placeholder) with an optional name/brand footer. */
export function ItemTile({
  item,
  onPress,
  showMeta = false,
  radius = Radius.md,
  style,
}: {
  item: ClothingItem;
  onPress?: () => void;
  showMeta?: boolean;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.wrap, pressed ? { opacity: 0.85 } : null, style]}>
      <View style={[styles.thumb, { borderRadius: radius }]}>
        {item.photoUri ? (
          <Image source={{ uri: item.photoUri }} style={styles.img} contentFit="cover" transition={120} />
        ) : (
          <PlaceholderThumb category={item.category} radius={radius} style={styles.img} />
        )}
      </View>
      {showMeta ? (
        <View style={styles.meta}>
          <Txt variant="small" numberOfLines={1}>
            {item.name}
          </Txt>
          <Txt variant="caption" color="textMuted" numberOfLines={1}>
            {item.brand || item.category}
          </Txt>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  thumb: { aspectRatio: 1, backgroundColor: palette.cloud, overflow: 'hidden' },
  img: { width: '100%', height: '100%' },
  meta: { marginTop: 6, gap: 1 },
});
