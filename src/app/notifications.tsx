import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { BackTitle } from '@/components/sub-header';
import { TopBar } from '@/components/top-bar';
import { Ionicons } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { Txt } from '@/components/ui/text';
import { palette, Spacing } from '@/constants/theme';

export default function NotificationsScreen() {
  const router = useRouter();
  return (
    <Screen header={<TopBar left={<BackTitle title="Notifications" onBack={() => router.back()} />} />}>
      <View style={styles.empty}>
        <Ionicons name="notifications-outline" size={48} color={palette.silver} />
        <Txt variant="body" color="textMuted" style={{ marginTop: Spacing.md }}>
          No notifications
        </Txt>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: Spacing.six * 2 },
});
