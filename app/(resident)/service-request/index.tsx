import React from 'react';
import { ScrollView, StyleSheet, View, Text } from 'react-native';
import Card from '@/components/ui/Card';
import CreateServiceRequestForm from '@/components/CreateServiceRequestForm';
import { MaterialIcons } from '@expo/vector-icons';

const ServiceRequestScreen = () => {
  const handleServiceRequestSubmitted = () => {
    // Could potentially trigger a refresh or navigation
    console.log('Service request submitted successfully from the screen.');
  };

  return (
    <ScrollView style={styles.container}>
      <Card>
        <View style={styles.header}>
          <MaterialIcons name="build" size={24} color="black" />
          <Text style={styles.title}>Request New Service</Text>
        </View>
        <CreateServiceRequestForm
          onServiceRequestSubmitted={handleServiceRequestSubmitted}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default ServiceRequestScreen;
