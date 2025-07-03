import { Text as ThemedText, View as ThemedView } from '@/components/Themed';
import React from 'react';

export default function MyPropertyScreen() {
  return (
    <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ThemedText>My Property</ThemedText>
    </ThemedView>
  );
}
