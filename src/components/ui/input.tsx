import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { Fonts, palette, Radius } from '@/constants/theme';

export function Input({ style, ...rest }: TextInputProps) {
  return (
    <TextInput placeholderTextColor={palette.gray} style={[styles.input, style]} {...rest} />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: palette.hairline,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: palette.ink,
    fontFamily: Fonts.sans,
    backgroundColor: palette.white,
  },
});
