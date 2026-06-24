import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { EditSheet, type EditConfig } from '@/components/edit-sheet';
import { BackTitle } from '@/components/sub-header';
import { TopBar } from '@/components/top-bar';
import { Ionicons } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { Txt } from '@/components/ui/text';
import { comingSoon } from '@/lib/ui';
import { palette, Radius, Spacing } from '@/constants/theme';
import { useCloset } from '@/store/closet';

const SENSITIVITY: Record<NonNullable<ReturnType<typeof labelKey>>, string> = {
  cold: 'I run cold 🥶',
  neutral: 'Just about right 😄',
  warm: 'I run warm 🥵',
};
function labelKey(v?: string) {
  return (v === 'cold' || v === 'warm' ? v : 'neutral') as 'cold' | 'neutral' | 'warm';
}

type EditKey = 'tempSensitivity' | 'stylistNote' | 'preferredBrands';

export default function StylingSettingsScreen() {
  const router = useRouter();
  const settings = useCloset((s) => s.settings);
  const setSettings = useCloset((s) => s.setSettings);
  const [edit, setEdit] = useState<{ key: EditKey; config: EditConfig } | null>(null);

  const onSave = (v: string[] | string) => {
    if (!edit) return;
    const val = Array.isArray(v) ? v[0] : v;
    if (edit.key === 'tempSensitivity') {
      const key = (Object.keys(SENSITIVITY) as (keyof typeof SENSITIVITY)[]).find((k) => SENSITIVITY[k] === val);
      setSettings({ tempSensitivity: key ?? 'neutral' });
    } else if (edit.key === 'stylistNote') {
      setSettings({ stylistNote: val });
    } else if (edit.key === 'preferredBrands') {
      setSettings({ preferredBrands: val });
    }
  };

  return (
    <Screen header={<TopBar left={<BackTitle title="Outfit suggestion settings" onBack={() => router.back()} />} />}>
      <Item
        label="Style profile quiz"
        value={settings.styleProfile?.completedAt ? 'Completed · tap to redo' : 'Personalize your stylist'}
        onPress={() => router.push('/stylist/quiz')}
      />
      <Item
        label="Location"
        value={settings.homeCity || 'Set city'}
        onPress={() => router.push('/profile')}
      />
      <Item label="Closet for Outfit Suggestions" value="All clothes" onPress={() => comingSoon('Choose closet')} />
      <Item
        label="Set Your Temperature Sensitivity"
        value={SENSITIVITY[labelKey(settings.tempSensitivity)]}
        onPress={() =>
          setEdit({
            key: 'tempSensitivity',
            config: { kind: 'chips', title: 'Temperature sensitivity', options: Object.values(SENSITIVITY), multi: false, value: [] },
          })
        }
      />
      <Item label="Excluded items" onPress={() => comingSoon('Excluded items')} />
      <Item label="Mismatched Combinations" onPress={() => comingSoon('Mismatched combinations')} />
      <Item
        label="Note to Stylist"
        sub={settings.stylistNote || 'Any rules your Personal AI stylist should know?'}
        onPress={() =>
          setEdit({
            key: 'stylistNote',
            config: { kind: 'text', title: 'Note to stylist', value: settings.stylistNote ?? '', placeholder: 'e.g. I never wear yellow' },
          })
        }
      />
      <Item
        label="Preferred Brands"
        value={settings.preferredBrands || undefined}
        onPress={() =>
          setEdit({
            key: 'preferredBrands',
            config: { kind: 'text', title: 'Preferred brands', value: settings.preferredBrands ?? '', placeholder: 'e.g. Uniqlo, COS, Nike' },
          })
        }
      />

      <EditSheet config={edit?.config ?? null} onClose={() => setEdit(null)} onSave={onSave} />
    </Screen>
  );
}

function Item({ label, value, sub, onPress }: { label: string; value?: string; sub?: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed ? { opacity: 0.6 } : null]}>
      <View style={{ flex: 1, gap: 6 }}>
        <View style={styles.rowTop}>
          <Txt variant="body" style={{ fontWeight: '600' }}>{label}</Txt>
          <Ionicons name="chevron-forward" size={16} color={palette.gray} />
        </View>
        {value ? (
          <View style={styles.pill}>
            <Txt variant="caption" color="accent">{value}</Txt>
          </View>
        ) : null}
        {sub ? <Txt variant="small" color="textMuted">{sub}</Txt> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { paddingVertical: Spacing.lg, borderBottomWidth: 1, borderBottomColor: palette.hairline },
  rowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pill: { alignSelf: 'flex-start', backgroundColor: palette.blueSoft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.pill },
});
