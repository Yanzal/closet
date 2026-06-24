import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { EditSheet, type EditConfig } from '@/components/edit-sheet';
import { BackTitle } from '@/components/sub-header';
import { TopBar } from '@/components/top-bar';
import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Ionicons } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { Txt } from '@/components/ui/text';
import { palette, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { isOwned } from '@/lib/owned';
import type { AppSettings } from '@/lib/types';
import { comingSoon } from '@/lib/ui';
import { useCloset } from '@/store/closet';

type SettingKey = keyof AppSettings | 'name';

export default function ProfileScreen() {
  const router = useRouter();
  const { enabled: authEnabled, session, signOut } = useAuth();
  const items = useCloset((s) => s.items);
  const settings = useCloset((s) => s.settings);
  const profileName = useCloset((s) => s.profileName);
  const setSettings = useCloset((s) => s.setSettings);
  const setProfileName = useCloset((s) => s.setProfileName);

  const [edit, setEdit] = useState<{ key: SettingKey; config: EditConfig } | null>(null);
  const ownedCount = items.filter(isOwned).length;
  const name = profileName?.trim() || 'Guest';

  const open = (key: SettingKey, config: EditConfig) => setEdit({ key, config });
  const onSave = (v: string[] | string) => {
    if (!edit) return;
    const val = Array.isArray(v) ? v[0] : v;
    switch (edit.key) {
      case 'name':
        setProfileName(val);
        break;
      case 'weekStartsMonday':
        setSettings({ weekStartsMonday: val === 'Monday' });
        break;
      case 'tempUnit':
        setSettings({ tempUnit: val === '°F' ? 'F' : 'C' });
        break;
      case 'currency':
        setSettings({ currency: val });
        break;
      case 'country':
        setSettings({ country: val });
        break;
      case 'language':
        setSettings({ language: val });
        break;
      case 'homeCity':
        setSettings({ homeCity: val });
        break;
    }
  };

  return (
    <Screen header={<TopBar left={<BackTitle title="My page" onBack={() => router.back()} />} />}>
      {/* Profile */}
      <View style={styles.profileRow}>
        <Avatar name={name} size={56} />
        <View style={{ flex: 1 }}>
          <Txt variant="h2">{name}</Txt>
          <Txt variant="small" color="textMuted">
            {authEnabled && session?.user?.email ? `Synced · ${session.user.email}` : 'Local profile · on-device'}
          </Txt>
        </View>
        <Pressable onPress={() => open('name', { kind: 'text', title: 'Your name', value: profileName, placeholder: 'Your name' })} hitSlop={8}>
          <Ionicons name="pencil" size={20} color={palette.gray} />
        </Pressable>
      </View>

      {/* Closet usage */}
      <Card padded style={{ marginTop: Spacing.lg }}>
        <Txt variant="small" color="textMuted">My closet</Txt>
        <Txt variant="h2">{ownedCount}/100</Txt>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${Math.min(100, ownedCount)}%` }]} />
        </View>
      </Card>

      {/* Quick cards */}
      <View style={styles.quickRow}>
        <QuickCard emoji="📊" label="Style stats" onPress={() => router.push('/stats')} />
        <QuickCard emoji="🗂️" label="Archive" onPress={() => router.push('/archive')} />
        <QuickCard emoji="🔍" label="Closet Review" onPress={() => router.push('/review')} />
      </View>

      {/* Settings */}
      <Txt variant="label" color="textMuted" style={styles.sectionLabel}>Account settings</Txt>
      <Card>
        <Row label="Week start day" value={settings.weekStartsMonday ? 'Monday' : 'Sunday'} onPress={() => open('weekStartsMonday', { kind: 'chips', title: 'Week start day', options: ['Sunday', 'Monday'], multi: false, value: [] })} />
        <Row label="Temperature unit" value={`°${settings.tempUnit}`} onPress={() => open('tempUnit', { kind: 'chips', title: 'Temperature unit', options: ['°C', '°F'], multi: false, value: [] })} />
        <Row label="Currency" value={settings.currency} onPress={() => open('currency', { kind: 'chips', title: 'Currency', options: ['$', '£', '€', '¥'], multi: false, value: [] })} />
        <Row label="Country" value={settings.country} onPress={() => open('country', { kind: 'text', title: 'Country', value: settings.country })} />
        <Row label="Home city" value={settings.homeCity || 'Set city'} onPress={() => open('homeCity', { kind: 'text', title: 'Home city', value: settings.homeCity ?? '', placeholder: 'e.g. Auckland' })} />
        <Row label="Language" value={settings.language} onPress={() => open('language', { kind: 'chips', title: 'Language', options: ['English', 'Korean', 'Japanese', 'Spanish'], multi: false, value: [] })} last />
      </Card>

      <Txt variant="label" color="textMuted" style={styles.sectionLabel}>More</Txt>
      <Card>
        <Row label="Notifications" onPress={() => comingSoon('Notifications')} />
        <Row label="Outfit suggestion settings" onPress={() => comingSoon('Outfit suggestion settings')} />
        <Row label="FAQ & feedback" onPress={() => comingSoon('Customer service')} />
        {authEnabled && session ? (
          <Row
            label="Sign out"
            value={session.user?.email ?? undefined}
            onPress={() =>
              Alert.alert('Sign out', 'Sign out of this device? Your closet stays safe in the cloud.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sign out', style: 'destructive', onPress: () => void signOut() },
              ])
            }
            last
          />
        ) : (
          <Row
            label="Sign in / account"
            value="Local only"
            onPress={() => Alert.alert('Accounts', 'Sign-in and sync turn on once the app owner configures it.')}
            last
          />
        )}
      </Card>

      <EditSheet config={edit?.config ?? null} onClose={() => setEdit(null)} onSave={onSave} />
    </Screen>
  );
}

function QuickCard({ emoji, label, onPress }: { emoji: string; label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.quickCard} onPress={onPress}>
      <Txt style={{ fontSize: 24 }}>{emoji}</Txt>
      <Txt variant="caption" color="textSecondary">{label}</Txt>
    </Pressable>
  );
}

function Row({ label, value, onPress, last }: { label: string; value?: string; onPress: () => void; last?: boolean }) {
  return (
    <Pressable onPress={onPress} style={[styles.row, last ? null : styles.rowBorder]}>
      <Txt variant="body">{label}</Txt>
      <View style={styles.rowRight}>
        {value ? <Txt variant="small" color="accent">{value}</Txt> : null}
        <Ionicons name="chevron-forward" size={16} color={palette.gray} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginTop: Spacing.sm },
  track: { height: 8, borderRadius: 4, backgroundColor: palette.mist, overflow: 'hidden', marginTop: 8 },
  fill: { height: '100%', backgroundColor: palette.blue, borderRadius: 4 },
  quickRow: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.lg },
  quickCard: { flex: 1, alignItems: 'center', gap: 8, paddingVertical: Spacing.lg, backgroundColor: palette.cloud, borderRadius: Radius.lg },
  sectionLabel: { marginTop: Spacing.xl, marginBottom: Spacing.sm, marginLeft: 4 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, paddingHorizontal: Spacing.lg },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: palette.hairline },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
