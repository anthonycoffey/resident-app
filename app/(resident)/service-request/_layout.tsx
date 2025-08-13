import { Stack } from 'expo-router';
import React from 'react';
import { ServiceRequestProvider } from '@/lib/context/ServiceRequestContext';
import { useThemeColor } from '@/components/Themed';

export default function ServiceRequestLayout() {
  const headerTintColor = useThemeColor({}, 'tint');

  return (
    <ServiceRequestProvider>
      <Stack>
        <Stack.Screen name='index' options={{ headerShown: false , title: 'Back',}} />
        <Stack.Screen
          name='address-search'
          options={{
            title: 'Search Address',
            headerTintColor: headerTintColor,
          }}
        />
      </Stack>
    </ServiceRequestProvider>
  );
}
