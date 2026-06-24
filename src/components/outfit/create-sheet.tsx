import { useRouter } from 'expo-router';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Ionicons, MaterialCommunityIcons } from '@/components/ui/icon';
import { Txt } from '@/components/ui/text';
import { palette, Radius, Spacing } from '@/constants/theme';

type Mode = {
  key: string;
  label: string;
  hint: string;
  icon: React.ReactNode;
  tint: string;
  href: string;
};

const MODES: Mode[] = [
  {
    key: 'free',
    label: 'Place freely',
    hint: 'Drag items on a canvas',
    icon: <MaterialCommunityIcons name="gesture-tap-button" size={26} color={palette.ink} />,
    tint: palette.sky,
    href: '/outfit/builder',
  },
  {
    key: 'category',
    label: 'Select by category',
    hint: 'Pick one from each layer',
    icon: <Ionicons name="grid-outline" size={24} color={palette.ink} />,
    tint: palette.lavender,
    href: '/outfit/builder?mode=category',
  },
  {
    key: 'layout',
    label: 'Acloset Layout',
    hint: 'Auto-arrange a neat look',
    icon: <MaterialCommunityIcons name="view-grid-plus-outline" size={24} color={palette.ink} />,
    tint: palette.mint,
    href: '/outfit/builder?mode=layout',
  },
  {
    key: 'suggest',
    label: 'Outfit Suggestions',
    hint: 'Let the stylist choose',
    icon: <Ionicons name="sparkles-outline" size={22} color={palette.ink} />,
    tint: palette.pink,
    href: '/stylist/suggest',
  },
];

/** "How would you like to create an outfit" sheet (mockup IMG_7398). */
export function OutfitCreateSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const go = (href: string) => {
    onClose();
    router.push(href as never);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.wrap} pointerEvents="box-none">
        <View style={[styles.sheet, { paddingBottom: insets.bottom + Spacing.lg }]}>
          <View style={styles.grabber} />
          <Txt variant="h2" style={{ marginBottom: Spacing.lg }}>
            How would you like to create an outfit?
          </Txt>
          <View style={styles.grid}>
            {MODES.map((m) => (
              <Pressable
                key={m.key}
                onPress={() => go(m.href)}
                style={({ pressed }) => [styles.card, pressed ? { opacity: 0.7 } : null]}>
                <View style={[styles.iconWrap, { backgroundColor: m.tint }]}>{m.icon}</View>
                <Txt variant="bodyStrong">{m.label}</Txt>
                <Txt variant="caption" color="textMuted">{m.hint}</Txt>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10,12,20,0.35)' },
  wrap: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  sheet: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: palette.white,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  grabber: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: palette.hairline, marginBottom: Spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  card: {
    width: '47.5%',
    flexGrow: 1,
    backgroundColor: palette.cloud,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: 6,
    minHeight: 132,
    justifyContent: 'flex-end',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 'auto',
  },
});
