import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { Txt } from '@/components/ui/text';
import { palette, Radius, Spacing } from '@/constants/theme';
import { useCloset } from '@/store/closet';

/** Shown once after a new user's first sign-in, to set the name greeting uses everywhere. */
export default function WelcomeScreen() {
  const router = useRouter();
  const setProfileName = useCloset((s) => s.setProfileName);
  const setSettings = useCloset((s) => s.setSettings);
  const [name, setName] = useState('');

  const finish = (v?: string) => {
    if (v) setProfileName(v);
    setSettings({ namePrompted: true });
    router.replace('/');
  };
  const save = () => finish(name.trim() || undefined);

  return (
    <Screen>
      <View style={styles.hero}>
        <View style={styles.logo}>
          <Txt style={{ fontSize: 34 }}>👋</Txt>
        </View>
        <Txt variant="h1" style={{ marginTop: Spacing.lg }}>Welcome!</Txt>
        <Txt variant="small" color="textMuted">What should we call you?</Txt>
      </View>

      <View style={{ marginTop: Spacing.xxl, gap: Spacing.md }}>
        <Input
          placeholder="Your name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          autoFocus
          onSubmitEditing={save}
          returnKeyType="done"
        />
        <Button title="Continue" onPress={save} disabled={!name.trim()} />
        <Button title="Skip for now" variant="ghost" onPress={() => finish()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', marginTop: Spacing.six },
  logo: {
    width: 76,
    height: 76,
    borderRadius: Radius.xl,
    backgroundColor: palette.cloud,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
