import { Stack } from 'expo-router';
import React from 'react';
import { ServiceRequestProvider } from '@/lib/context/ServiceRequestContext';

export default function ServiceRequestLayout() {
  return (
    <ServiceRequestProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false  }} />
        <Stack.Screen
          name='address-search'
          options={{
            title: 'Search Address',
            headerBackTitle: '',
          }}
        />
      </Stack>
    </ServiceRequestProvider>
  );
}
