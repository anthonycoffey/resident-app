import React from 'react';
import { ScrollView } from 'react-native';
import { Text, View, useThemeColor } from '@/components/Themed';
import Card from '@/components/ui/Card';
import CreateServiceRequestForm from '@/components/CreateServiceRequestForm';
import { MaterialIcons } from '@expo/vector-icons';
import { useServiceRequest } from '@/lib/context/ServiceRequestContext';

const ServiceRequestScreen = () => {
  const { address } = useServiceRequest();
  const iconColor = useThemeColor({}, 'text');

  const handleServiceRequestSubmitted = () => {
    // Could potentially trigger a refresh or navigation
    console.log('Service request submitted successfully from the screen.');
  };

  return (
    <ScrollView style={{ flex: 1 }}>
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, backgroundColor: 'transparent' }}>
          <MaterialIcons name="build" size={24} color={iconColor} />
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginLeft: 10 }}>Service Request Form</Text>
        </View>
        <CreateServiceRequestForm
          onServiceRequestSubmitted={handleServiceRequestSubmitted}
          address={address}
        />
      </Card>
    </ScrollView>
  );
};

export default ServiceRequestScreen;
