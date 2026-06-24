import { Image } from 'expo-image';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { PlaceholderThumb } from '@/components/placeholder-thumb';
import { palette, Radius } from '@/constants/theme';
import type { ClothingItem, PlacedNode } from '@/lib/types';

/** Item base width as a fraction of the canvas width (a node at scale 1). */
export const NODE_BASE = 0.34;

/** Static render of a saved outfit's nodes, for thumbnails and detail views. */
export function OutfitPreview({
  items,
  nodes,
  size,
  style,
}: {
  items: ClothingItem[];
  nodes: PlacedNode[];
  size: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[{ width: size, height: size }, styles.box, style]}>
      {nodes.map((n) => {
        const item = items.find((i) => i.id === n.itemId);
        if (!item) return null;
        const s = size * NODE_BASE * n.scale;
        return (
          <View
            key={n.key}
            style={{ position: 'absolute', left: n.cx * size - s / 2, top: n.cy * size - s / 2, width: s, height: s }}>
            {item.photoUri ? (
              <Image source={{ uri: item.photoUri }} style={styles.fill} contentFit="contain" />
            ) : (
              <PlaceholderThumb category={item.category} radius={Radius.sm} glyphSize={s * 0.4} style={styles.fill} />
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { overflow: 'hidden', backgroundColor: palette.white },
  fill: { width: '100%', height: '100%' },
});
