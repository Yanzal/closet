import { Image } from 'expo-image';
import { View } from 'react-native';

import { palette } from '@/constants/theme';
import { Txt } from './text';

export function Avatar({ name, uri, size = 36 }: { name?: string; uri?: string; size?: number }) {
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        contentFit="cover"
      />
    );
  }
  const initial = (name?.trim()?.charAt(0) ?? '?').toUpperCase();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: palette.lavender,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Txt variant="label">{initial}</Txt>
    </View>
  );
}
