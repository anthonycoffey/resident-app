import { Stack } from 'expo-router';

export default function ServiceProviderLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
