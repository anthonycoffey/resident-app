import React from 'react';
import { SafeAreaView } from 'react-native';
import CommunityBoard from '@/components/CommunityBoard';

const DashboardScreen = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <CommunityBoard />
    </SafeAreaView>
  );
};

export default DashboardScreen;
