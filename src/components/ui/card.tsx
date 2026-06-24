import { View, type ViewProps } from 'react-native';

import { palette, Radius, Shadow, Spacing } from '@/constants/theme';

export function Card({
  style,
  tint,
  bordered = true,
  shadow = false,
  padded = false,
  radius = Radius.lg,
  ...rest
}: ViewProps & {
  tint?: string;
  bordered?: boolean;
  shadow?: boolean;
  padded?: boolean;
  radius?: number;
}) {
  return (
    <View
      style={[
        { borderRadius: radius, backgroundColor: tint ?? palette.white },
        bordered && !tint ? { borderWidth: 1, borderColor: palette.hairline } : null,
        shadow ? Shadow.card : null,
        padded ? { padding: Spacing.lg } : null,
        style,
      ]}
      {...rest}
    />
  );
}
