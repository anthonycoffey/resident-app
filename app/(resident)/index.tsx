import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import ResidentQuickNav from '@/components/ResidentQuickNav';
import ServiceRequestList from '@/components/ServiceRequestList';
import { View } from '@/components/Themed';

const DashboardScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <ResidentQuickNav />
        <ServiceRequestList />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 15,
  },
});

export default DashboardScreen;
