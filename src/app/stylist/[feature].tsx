import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { BackTitle } from '@/components/sub-header';
import { TopBar } from '@/components/top-bar';
import { Card } from '@/components/ui/card';
import { Ionicons } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { Txt } from '@/components/ui/text';
import { palette, Radius, Spacing } from '@/constants/theme';

const COPY: Record<string, { emoji: string; title: string; body: string }> = {
  fit: { emoji: '📐', title: 'Find my fit', body: 'Snap a full-body photo and get tailored fit & silhouette guidance for your shape.' },
  rate: { emoji: '⭐', title: 'Rate my style', body: 'Get an honest score and quick tips on any outfit you put together.' },
  tryon: { emoji: '🥽', title: 'Virtual try-on', body: 'Preview your clothes on a model of you before you wear them.' },
  chat: { emoji: '💬', title: 'Style chat', body: 'Chat with your personal stylist about what to wear, buy, or skip.' },
  beautify: { emoji: '🪄', title: 'Beautify', body: 'Turn any snap into a clean, catalogue-style flat image — automatically.' },
};

export default function StylistFeatureScreen() {
  const router = useRouter();
  const { feature } = useLocalSearchParams<{ feature: string }>();
  const c = COPY[feature ?? ''] ?? { emoji: '✨', title: 'Stylist', body: 'A smarter way to get dressed.' };

  return (
    <Screen header={<TopBar left={<BackTitle title={c.title} onBack={() => router.back()} />} />}>
      <Card style={styles.card}>
        <Txt style={{ fontSize: 44 }}>{c.emoji}</Txt>
        <Txt variant="title">{c.title}</Txt>
        <Txt variant="small" color="textMuted" style={{ textAlign: 'center' }}>
          {c.body}
        </Txt>
        <View style={styles.badge}>
          <Ionicons name="sparkles-outline" size={13} color={palette.blue} />
          <Txt variant="caption" color="accent">Powered by on-device AI — coming soon</Txt>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', gap: 10, paddingVertical: Spacing.six, paddingHorizontal: Spacing.lg, marginTop: Spacing.lg },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: palette.blueSoft,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.pill,
    marginTop: 4,
  },
});
