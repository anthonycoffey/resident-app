import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    // A simple timer to hide the splash screen after the webview has had a chance to load.
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 1000); // Hide after 1 second

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <WebView
        source={{ uri: 'https://amenilink.com/' }}
        style={{ flex: 1 }}
      />
    </SafeAreaView>
  );
}
