import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

import { NODE_BASE } from '@/components/outfit/outfit-preview';
import { PlaceholderThumb } from '@/components/placeholder-thumb';
import { palette, Radius } from '@/constants/theme';
import type { ClothingItem, PlacedNode } from '@/lib/types';

/**
 * Item on the builder canvas. Dragging runs on the UI thread (reanimated) for smoothness;
 * the committed fractional position is pushed to the parent on release. Scale is controlled
 * by the parent (toolbar buttons), so it works with a mouse on web too.
 */
export function DraggableItem({
  item,
  node,
  canvasW,
  canvasH,
  selected,
  onSelect,
  onMove,
}: {
  item: ClothingItem;
  node: PlacedNode;
  canvasW: number;
  canvasH: number;
  selected: boolean;
  onSelect: (key: string) => void;
  onMove: (key: string, cx: number, cy: number) => void;
}) {
  const x = useSharedValue(node.cx * canvasW);
  const y = useSharedValue(node.cy * canvasH);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const size = canvasW * NODE_BASE * node.scale;

  const pan = Gesture.Pan()
    .onBegin(() => {
      startX.value = x.value;
      startY.value = y.value;
      runOnJS(onSelect)(node.key);
    })
    .onChange((e) => {
      x.value = Math.min(Math.max(startX.value + e.translationX, 0), canvasW);
      y.value = Math.min(Math.max(startY.value + e.translationY, 0), canvasH);
    })
    .onEnd(() => {
      runOnJS(onMove)(node.key, x.value / canvasW, y.value / canvasH);
    });

  const aStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value - size / 2 }, { translateY: y.value - size / 2 }],
  }));

  return (
    <Animated.View
      style={[styles.node, { width: size, height: size }, aStyle, selected ? styles.selected : null]}>
      <GestureDetector gesture={pan}>
        <View style={styles.fill}>
          {item.photoUri ? (
            <Image source={{ uri: item.photoUri }} style={styles.fill} contentFit="contain" />
          ) : (
            <PlaceholderThumb category={item.category} radius={Radius.sm} glyphSize={size * 0.4} style={styles.fill} />
          )}
        </View>
      </GestureDetector>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  node: { position: 'absolute', left: 0, top: 0 },
  selected: { borderWidth: 1.5, borderColor: palette.blue, borderStyle: 'dashed', borderRadius: Radius.sm },
  fill: { width: '100%', height: '100%' },
});
