import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { Txt } from '@/components/ui/text';
import { palette, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    setBusy(true);
    setError(null);
    const { error } = await signIn(email, password);
    setBusy(false);
    if (error) {
      setError(error);
      return;
    }
    router.replace('/');
  };

  return (
    <Screen>
      <View style={styles.hero}>
        <View style={styles.logo}>
          <Txt style={{ fontSize: 34 }}>👗</Txt>
        </View>
        <Txt variant="h1" style={{ marginTop: Spacing.lg }}>Closet</Txt>
        <Txt variant="small" color="textMuted">Sign in to your wardrobe</Txt>
      </View>

      <View style={{ gap: Spacing.md, marginTop: Spacing.xxl }}>
        <Input
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          inputMode="email"
          textContentType="username"
        />
        <Input
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          textContentType="password"
          onSubmitEditing={submit}
          returnKeyType="go"
        />
        {error ? (
          <View style={styles.errorBox}>
            <Txt variant="small" style={{ color: palette.danger }}>{error}</Txt>
          </View>
        ) : null}
        <Button title="Sign in" onPress={submit} loading={busy} style={{ marginTop: 4 }} />
      </View>

      <Txt variant="caption" color="textMuted" style={styles.footer}>
        Accounts are created by the app owner. Ask them to set you up if you don&apos;t have a login.
      </Txt>
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
  errorBox: {
    backgroundColor: '#FCEBEC',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  footer: { textAlign: 'center', marginTop: Spacing.xxl },
});
