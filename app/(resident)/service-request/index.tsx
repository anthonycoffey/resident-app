import React from 'react';
import { ScrollView, StyleSheet, View, Text } from 'react-native';
import Card from '@/components/ui/Card';
import CreateServiceRequestForm from '@/components/CreateServiceRequestForm';
import { MaterialIcons } from '@expo/vector-icons';
import { useServiceRequest } from '@/lib/context/ServiceRequestContext';

const ServiceRequestScreen = () => {
  const { address } = useServiceRequest();

  const handleServiceRequestSubmitted = () => {
    // Could potentially trigger a refresh or navigation
    console.log('Service request submitted successfully from the screen.');
  };

  return (
    <ScrollView style={styles.container}>
      <Card>
        <CreateServiceRequestForm
          onServiceRequestSubmitted={handleServiceRequestSubmitted}
          address={address}
        />
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default ServiceRequestScreen;
