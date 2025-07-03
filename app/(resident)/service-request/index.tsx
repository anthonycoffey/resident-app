import { Text as ThemedText, View as ThemedView } from '@/components/Themed';
import React from 'react';

export default function ServiceRequestScreen() {
  return (
    <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ThemedText>Service Request</ThemedText>
    </ThemedView>
  );
}
