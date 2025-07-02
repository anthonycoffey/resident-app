import React from 'react';
import { View, Text, Button } from 'react-native';
import { useAuth } from '@/lib/providers/AuthProvider';

const ServiceProviderDashboard = () => {
  const { logout } = useAuth();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Service Provider Dashboard</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
};

export default ServiceProviderDashboard;
