import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Input } from '@/components/ui/input';
import { Txt } from '@/components/ui/text';
import { palette, Radius, Spacing } from '@/constants/theme';
import { colorHex } from '@/lib/categories';

export type EditConfig =
  | { kind: 'chips'; title: string; options: string[]; multi: boolean; value: string[]; colorDots?: boolean }
  | { kind: 'text'; title: string; value: string; placeholder?: string; numeric?: boolean };

/** A bottom-sheet editor for a single attribute (multi/single chips, or text/number). */
export function EditSheet({
  config,
  onClose,
  onSave,
}: {
  config: EditConfig | null;
  onClose: () => void;
  onSave: (value: string[] | string) => void;
}) {
  return (
    <Modal visible={!!config} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      {config ? <Inner key={config.title} config={config} onClose={onClose} onSave={onSave} /> : null}
    </Modal>
  );
}

function Inner({
  config,
  onClose,
  onSave,
}: {
  config: EditConfig;
  onClose: () => void;
  onSave: (value: string[] | string) => void;
}) {
  const insets = useSafeAreaInsets();
  const [multiVal, setMultiVal] = useState<string[]>(config.kind === 'chips' ? config.value : []);
  const [textVal, setTextVal] = useState<string>(config.kind === 'text' ? config.value : '');

  const toggle = (o: string) =>
    setMultiVal((p) => (p.includes(o) ? p.filter((x) => x !== o) : [...p, o]));

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <View style={[styles.sheet, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <View style={styles.grabber} />
        <Txt variant="title">{config.title}</Txt>

        {config.kind === 'chips' ? (
          <>
            <ScrollView style={{ maxHeight: 300 }} contentContainerStyle={styles.chips}>
              {config.options.map((o) => {
                const selected = config.multi ? multiVal.includes(o) : false;
                return (
                  <Chip
                    key={o}
                    label={o}
                    selected={selected}
                    leading={
                      config.colorDots ? (
                        <View style={[styles.dot, { backgroundColor: colorHex(o) }]} />
                      ) : undefined
                    }
                    onPress={() => {
                      if (config.multi) toggle(o);
                      else {
                        onSave(o);
                        onClose();
                      }
                    }}
                  />
                );
              })}
            </ScrollView>
            {config.multi ? (
              <Button
                title="Save"
                onPress={() => {
                  onSave(multiVal);
                  onClose();
                }}
                style={{ marginTop: Spacing.md }}
              />
            ) : null}
          </>
        ) : (
          <>
            <Input
              value={textVal}
              onChangeText={(t) => setTextVal(config.numeric ? t.replace(/[^0-9.]/g, '') : t)}
              placeholder={config.placeholder}
              keyboardType={config.numeric ? 'decimal-pad' : 'default'}
              autoFocus
              style={{ marginTop: Spacing.md }}
            />
            <Button
              title="Save"
              onPress={() => {
                onSave(textVal.trim());
                onClose();
              }}
              style={{ marginTop: Spacing.md }}
            />
          </>
        )}
      </View>
    </View>
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
    padding: Spacing.lg,
  },
  grabber: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: palette.hairline, marginBottom: Spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingTop: Spacing.md },
  dot: { width: 12, height: 12, borderRadius: 6, borderWidth: 1, borderColor: palette.hairline },
});
