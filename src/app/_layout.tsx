import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { palette } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/lib/auth';

/** Redirects between /login and the app based on auth state (no-op when auth is disabled). */
function AuthGate({ children }: { children: React.ReactNode }) {
  const { enabled, loading, session } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const onLogin = segments[0] === 'login';

  useEffect(() => {
    if (!enabled || loading) return;
    if (!session && !onLogin) router.replace('/login');
    else if (session && onLogin) router.replace('/');
  }, [enabled, loading, session, onLogin, router]);

  if (enabled && loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.white }}>
        <ActivityIndicator color={palette.ink} />
      </View>
    );
  }
  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <AuthProvider>
          <AuthGate>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: palette.mist },
              }}
            />
          </AuthGate>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
