import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Text } from '@/components/Themed';

type Vehicle = {
  make: string;
  model: string;
  year: number;
  color: string;
  plate: string;
};

const VehicleModalScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [vehicle, setVehicle] = useState<Vehicle>({
    make: '',
    model: '',
    year: 0,
    color: '',
    plate: '',
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (params.vehicle) {
      setIsEditing(true);
      setVehicle(JSON.parse(params.vehicle as string));
    }
  }, [params.vehicle]);

  const handleInputChange = (name: keyof Vehicle, value: string) => {
    setVehicle((prev) => ({
      ...prev,
      [name]: name === 'year' ? parseInt(value, 10) || 0 : value,
    }));
  };

  const handleSave = () => {
    // Basic validation
    if (!vehicle.make || !vehicle.model || !vehicle.year || !vehicle.color || !vehicle.plate) {
      Alert.alert('Error', 'All vehicle fields are required.');
      return;
    }
    // TODO: This should call the main save function, not just update local state.
    // For now, we navigate back and the profile screen will refetch.
    if (router.canGoBack()) {
      router.back();
    } else {
      // Fallback if there's no screen to go back to
      router.push('/my-profile');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isEditing ? 'Edit Vehicle' : 'Add Vehicle'}</Text>
      <Input
        placeholder="Make (e.g., Toyota)"
        value={vehicle.make}
        onChangeText={(val) => handleInputChange('make', val)}
      />
      <Input
        placeholder="Model (e.g., Camry)"
        value={vehicle.model}
        onChangeText={(val) => handleInputChange('model', val)}
      />
      <Input
        placeholder="Year (e.g., 2023)"
        value={vehicle.year > 0 ? vehicle.year.toString() : ''}
        onChangeText={(val) => handleInputChange('year', val)}
        keyboardType="number-pad"
      />
      <Input
        placeholder="Color (e.g., Blue)"
        value={vehicle.color}
        onChangeText={(val) => handleInputChange('color', val)}
      />
      <Input
        placeholder="License Plate"
        value={vehicle.plate}
        onChangeText={(val) => handleInputChange('plate', val)}
      />
      <Button title={isEditing ? 'Save Changes' : 'Add Vehicle'} onPress={handleSave} />
      <Button title="Cancel" onPress={() => router.back()} variant="outline" style={{ marginTop: 10 }} />

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default VehicleModalScreen;
