import { type ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MaxContentWidth, palette, Spacing, TabBarHeight } from '@/constants/theme';

/**
 * Page wrapper: a phone-width white column centered on a faint backdrop
 * (so the web preview reads like a phone), with safe-area + tab-bar insets.
 * Pass `header` for a fixed top bar above the scrolling content.
 */
export function Screen({
  children,
  scroll = true,
  header,
  padded = true,
  bottomInset = true,
  contentStyle,
  bg = palette.white,
}: {
  children: ReactNode;
  scroll?: boolean;
  header?: ReactNode;
  padded?: boolean;
  bottomInset?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  bg?: string;
}) {
  const insets = useSafeAreaInsets();
  const pad: ViewStyle = {
    paddingTop: header ? Spacing.sm : insets.top + Spacing.sm,
    paddingHorizontal: padded ? Spacing.lg : 0,
    paddingBottom: (bottomInset ? TabBarHeight : 0) + insets.bottom + Spacing.xl,
  };
  return (
    <View style={styles.page}>
      <View style={[styles.column, { backgroundColor: bg }]}>
        {header ? <View style={{ paddingTop: insets.top }}>{header}</View> : null}
        {scroll ? (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={[pad, contentStyle]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.flex, pad, contentStyle]}>{children}</View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: palette.mist, alignItems: 'center' },
  column: { flex: 1, width: '100%', maxWidth: MaxContentWidth, overflow: 'hidden' },
  flex: { flex: 1 },
});
