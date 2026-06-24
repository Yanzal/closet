import { useState, type ReactNode } from 'react';
import { View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';

/**
 * Simple wrap-based grid that measures its width and sizes children into equal
 * columns. Works inside a ScrollView (no FlatList virtualization nesting) — fine
 * for the modest item counts in this app.
 */
export function Grid<T>({
  data,
  numColumns = 2,
  gap = 12,
  renderItem,
  keyExtractor,
  style,
}: {
  data: T[];
  numColumns?: number;
  gap?: number;
  renderItem: (item: T, index: number, size: number) => ReactNode;
  keyExtractor: (item: T, index: number) => string;
  style?: StyleProp<ViewStyle>;
}) {
  const [width, setWidth] = useState(0);
  const size = width > 0 ? (width - gap * (numColumns - 1)) / numColumns : 0;
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  return (
    <View onLayout={onLayout} style={[{ flexDirection: 'row', flexWrap: 'wrap', gap }, style]}>
      {size > 0
        ? data.map((item, i) => (
            <View key={keyExtractor(item, i)} style={{ width: size }}>
              {renderItem(item, i, size)}
            </View>
          ))
        : null}
    </View>
  );
}
