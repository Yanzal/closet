import { type ReactNode } from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';

export function IconButton({
  children,
  onPress,
  size = 40,
  style,
}: {
  children: ReactNode;
  onPress?: () => void;
  size?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [
        { width: size, height: size, alignItems: 'center', justifyContent: 'center' },
        pressed ? { opacity: 0.55 } : null,
        style,
      ]}>
      {children}
    </Pressable>
  );
}
