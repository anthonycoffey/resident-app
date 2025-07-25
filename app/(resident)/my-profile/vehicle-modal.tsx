import React, { useState, useEffect } from 'react';
import { Platform, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Text, View } from '@/components/Themed';
import { useProfile } from '@/lib/context/ProfileContext';

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
  const { vehicles, addVehicle, updateVehicle } = useProfile();

  const [vehicle, setVehicle] = useState<Vehicle>({
    make: '',
    model: '',
    year: 0,
    color: '',
    plate: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [index, setIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (params.index) {
      const vehicleIndex = parseInt(params.index as string, 10);
      if (!isNaN(vehicleIndex) && vehicles[vehicleIndex]) {
        setIsEditing(true);
        setIndex(vehicleIndex);
        setVehicle(vehicles[vehicleIndex]);
      }
    } else {
      // Reset form for adding a new vehicle
      setIsEditing(false);
      setIndex(null);
      setVehicle({
        make: '',
        model: '',
        year: 0,
        color: '',
        plate: '',
      });
    }
  }, [params.index, vehicles]);

  const handleInputChange = (name: keyof Vehicle, value: string) => {
    setVehicle((prev) => ({
      ...prev,
      [name]: name === 'year' ? parseInt(value, 10) || 0 : value,
    }));
  };

  const handleSave = async () => {
    if (!vehicle.make || !vehicle.model || !vehicle.year || !vehicle.color || !vehicle.plate) {
      Alert.alert('Error', 'All vehicle fields are required.');
      return;
    }
    setSaving(true);
    try {
      if (isEditing && index !== null) {
        await updateVehicle(vehicle, index);
      } else {
        await addVehicle(vehicle);
      }
      router.push('/(resident)/my-profile');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred.';
      Alert.alert('Save Failed', message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>{isEditing ? 'Edit Vehicle' : 'Add Vehicle'}</Text>
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
      <Button 
        title={saving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Add Vehicle')} 
        onPress={handleSave} 
        disabled={saving}
      />
      <Button 
        title="Cancel" 
        onPress={() => router.push('/(resident)/my-profile')} 
        variant="outline" 
        style={{ marginTop: 10 }} 
        disabled={saving}
      />

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
};

export default VehicleModalScreen;
