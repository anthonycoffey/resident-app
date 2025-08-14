import 'react-native-get-random-values';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { AuthProvider, useAuth } from '@/lib/providers/AuthProvider';
import { NotificationsProvider } from '@/lib/context/NotificationsContext';
import { useRouter } from 'expo-router';
import * as Sentry from '@sentry/react-native';

// Sentry.init({
//   dsn: 'https://abd2439e409a0953c940e806a73c78ec@o4505751809884160.ingest.us.sentry.io/4509617982799872',

//   // Adds more context data to events (IP address, cookies, user, etc.)
//   // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
//   sendDefaultPii: true,

//   // Configure Session Replay
//   replaysSessionSampleRate: 0.1,
//   replaysOnErrorSampleRate: 1,
//   integrations: [
//     Sentry.mobileReplayIntegration(),
//     Sentry.feedbackIntegration(),
//   ],

//   // uncomment the line below to enable Spotlight (https://spotlightjs.com)
//   // spotlight: __DEV__,
// });

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(auth)/login',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default Sentry.wrap(function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <NotificationsProvider>
        <RootLayoutNav />
      </NotificationsProvider>
    </AuthProvider>
  );
});

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/(auth)/login');
      return;
    }

    const roles = user.claims.roles || [];
    let route: `/(resident)` | `/(service-provider)` | `/(auth)/login` =
      '/(auth)/login';

    if (roles.includes('resident') || roles.includes('admin')) {
      route = '/(resident)';
    } else if (roles.includes('service_provider')) {
      route = '/(service-provider)';
    }
    router.replace(route);
  }, [user, loading]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <Stack>
          <Stack.Screen name='(auth)' options={{ headerShown: false }} />
          <Stack.Screen name='(resident)' options={{ headerShown: false }} />
          <Stack.Screen
            name='(service-provider)'
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name='modal'
            options={{
              presentation: 'modal',
              headerTintColor: colorScheme === 'dark' ? DarkTheme.colors.primary : DefaultTheme.colors.primary,
            }}
          />
        </Stack>
      </KeyboardAvoidingView>
    </ThemeProvider>
  );
}
