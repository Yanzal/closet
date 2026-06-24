import { StyleSheet, Text, type TextProps } from 'react-native';

import { Colors, Fonts } from '@/constants/theme';

type Variant = 'h1' | 'h2' | 'title' | 'body' | 'bodyStrong' | 'small' | 'caption' | 'label';
type ColorKey = 'text' | 'textSecondary' | 'textMuted' | 'primary' | 'onPrimary' | 'accent';

export type TxtProps = TextProps & {
  variant?: Variant;
  color?: ColorKey;
};

export function Txt({ variant = 'body', color = 'text', style, ...rest }: TxtProps) {
  return (
    <Text
      style={[{ fontFamily: Fonts.sans, color: Colors.light[color] }, styles[variant], style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 28, lineHeight: 34, fontWeight: '700', letterSpacing: -0.4 },
  h2: { fontSize: 22, lineHeight: 28, fontWeight: '700', letterSpacing: -0.3 },
  title: { fontSize: 18, lineHeight: 24, fontWeight: '700', letterSpacing: -0.2 },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' },
  bodyStrong: { fontSize: 15, lineHeight: 22, fontWeight: '600' },
  small: { fontSize: 13, lineHeight: 18, fontWeight: '500' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' },
  label: { fontSize: 13, lineHeight: 16, fontWeight: '600' },
});
