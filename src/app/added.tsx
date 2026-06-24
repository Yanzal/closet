import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Ionicons } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/icon-button';
import { Screen } from '@/components/ui/screen';
import { Txt } from '@/components/ui/text';
import { TopBar } from '@/components/top-bar';
import { palette, Radius, Spacing } from '@/constants/theme';

export default function AddedScreen() {
  const router = useRouter();
  // We arrive here via router.replace('/added'), so there's no entry to go back to.
  // Dismiss to Home instead (or pop the modal stack if one exists).
  const dismiss = () => (router.canGoBack() ? router.back() : router.replace('/'));
  return (
    <Screen
      scroll={false}
      header={
        <TopBar
          left={
            <IconButton onPress={dismiss} style={{ marginLeft: -8 }}>
              <Ionicons name="close" size={26} color={palette.ink} />
            </IconButton>
          }
        />
      }>
      <View style={styles.top}>
        <View style={styles.check}>
          <Ionicons name="checkmark" size={30} color="#fff" />
        </View>
        <Txt variant="h1">Safely added</Txt>
      </View>

      <View style={styles.row}>
        <Pressable style={styles.card} onPress={() => router.replace({ pathname: '/stylist/[feature]', params: { feature: 'tryon' } })}>
          <Txt style={{ fontSize: 30 }}>🥽</Txt>
          <Txt variant="bodyStrong">Try On</Txt>
        </Pressable>
        <Pressable style={styles.card} onPress={() => router.replace('/stylist/rate')}>
          <Txt style={{ fontSize: 30 }}>⭐</Txt>
          <Txt variant="bodyStrong">Rate Outfit</Txt>
        </Pressable>
      </View>

      <Button title="Done" onPress={dismiss} style={{ marginTop: 'auto' }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { alignItems: 'center', gap: Spacing.md, marginTop: Spacing.six },
  check: { width: 64, height: 64, borderRadius: 32, backgroundColor: palette.blue, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.xxl },
  card: { flex: 1, alignItems: 'center', gap: 8, paddingVertical: Spacing.xl, borderWidth: 1, borderColor: palette.hairline, borderRadius: Radius.lg },
});
