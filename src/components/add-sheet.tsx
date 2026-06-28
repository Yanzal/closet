import { useRouter } from 'expo-router';
import { type ReactNode } from 'react';
import { Alert, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Feather, Ionicons } from '@/components/ui/icon';
import { Txt } from '@/components/ui/text';
import { palette, Radius, Spacing } from '@/constants/theme';

/** Bottom action sheet opened by the center (+) tab button (mockup 6). */
export function AddSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const go = (path: string) => {
    onClose();
    router.push(path as never);
  };
  const soon = (what: string) => {
    onClose();
    Alert.alert(what, 'Coming soon in a later milestone.');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.wrap} pointerEvents="box-none">
        <View style={[styles.sheet, { paddingBottom: insets.bottom + Spacing.lg }]}>
          <View style={styles.grabber} />

          <Group label="Item">
            <Row
              icon={<Feather name="plus-square" size={20} color={palette.ink} />}
              label="Add item"
              onPress={() => go('/add')}
            />
            <Row
              icon={<Ionicons name="copy-outline" size={20} color={palette.ink} />}
              label="Add multiple items"
              onPress={() => go('/add-batch')}
            />
            <Row
              icon={<Ionicons name="cloud-download-outline" size={20} color={palette.ink} />}
              label="Import from a link"
              onPress={() => go('/import')}
            />
            <Row
              icon={<Ionicons name="heart-outline" size={20} color={palette.ink} />}
              label="Add to wishlist"
              onPress={() => go('/add?wishlist=1')}
            />
          </Group>

          <Group label="Outfit">
            <Row
              icon={<Ionicons name="shirt-outline" size={20} color={palette.ink} />}
              label="Add to outfit book"
              onPress={() => go('/outfit/builder')}
            />
            <Row
              icon={<Ionicons name="calendar-outline" size={20} color={palette.ink} />}
              label="Add to calendar"
              onPress={() => go('/ootd')}
            />
          </Group>

          <Group label="Explore">
            <Row
              icon={<Feather name="upload" size={20} color={palette.ink} />}
              label="Upload post"
              onPress={() => soon('Explore upload')}
            />
          </Group>
        </View>
      </View>
    </Modal>
  );
}

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.group}>
      <Txt variant="caption" color="textMuted" style={styles.groupLabel}>
        {label}
      </Txt>
      {children}
    </View>
  );
}

function Row({ icon, label, onPress }: { icon: ReactNode; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed ? { opacity: 0.6 } : null]}>
      {icon}
      <Txt variant="body" color="text">
        {label}
      </Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10,12,20,0.35)',
  },
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
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: palette.hairline,
    marginBottom: Spacing.sm,
  },
  group: { paddingVertical: Spacing.sm },
  groupLabel: { marginBottom: 4, marginLeft: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: 14 },
});
