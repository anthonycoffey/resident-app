import React, { useState, useEffect, useCallback } from 'react';
import { Platform, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import debounce from 'lodash.debounce';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Text, View } from '@/components/Themed';
import { useProfile } from '@/lib/context/ProfileContext';
import { MaterialIcons } from '@expo/vector-icons';

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
  const [isDirty, setIsDirty] = useState(false);

  const saveVehicle = async (currentVehicle: Vehicle, vehicleIndex: number | null) => {
    if (!currentVehicle.make || !currentVehicle.model || !currentVehicle.year || !currentVehicle.color || !currentVehicle.plate) {
      // Don't save if the form is incomplete
      return;
    }
    setSaving(true);
    try {
      if (isEditing && vehicleIndex !== null) {
        await updateVehicle(currentVehicle, vehicleIndex);
      } else {
        const newIndex = await addVehicle(currentVehicle);
        router.setParams({ index: newIndex.toString() });
      }
      setIsDirty(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred.';
      Alert.alert('Save Failed', message);
    } finally {
      setSaving(false);
    }
  };

  const debouncedSave = useCallback(debounce(saveVehicle, 1000), [isEditing, updateVehicle, addVehicle, router]);

  useEffect(() => {
    if (params.index) {
      const vehicleIndex = parseInt(params.index as string, 10);
      if (!isNaN(vehicleIndex) && vehicles[vehicleIndex]) {
        setIsEditing(true);
        setIndex(vehicleIndex);
        setVehicle(vehicles[vehicleIndex]);
        setIsDirty(false);
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
      setIsDirty(false);
    }
  }, [params.index, vehicles]);

  const handleInputChange = (name: keyof Vehicle, value: string) => {
    setIsDirty(true);
    const newVehicle = {
      ...vehicle,
      [name]: name === 'year' ? parseInt(value, 10) || 0 : name === 'plate' ? value.toUpperCase() : value,
    };
    setVehicle(newVehicle);
    debouncedSave(newVehicle, index);
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
         <Stack.Screen
        options={{
          headerTitle: isEditing ? 'Edit Vehicle' : 'Add Vehicle',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.push('/my-profile')}
              style={{ paddingHorizontal: 10 }}
            >
              <MaterialIcons name='arrow-back' size={24}  />
            </TouchableOpacity>
          ),
        }}
      />
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>{isEditing ? 'Edit Vehicle' : 'Add Vehicle'}</Text>
      <Input
        placeholder="Make"
        value={vehicle.make}
        onChangeText={(val) => handleInputChange('make', val)}
      />
      <Input
        placeholder="Model"
        value={vehicle.model}
        onChangeText={(val) => handleInputChange('model', val)}
      />
      <Input
        placeholder="Year"
        value={vehicle.year > 0 ? vehicle.year.toString() : ''}
        onChangeText={(val) => handleInputChange('year', val)}
        keyboardType="number-pad"
      />
      <Input
        placeholder="Color"
        value={vehicle.color}
        onChangeText={(val) => handleInputChange('color', val)}
      />
      <Input
        placeholder="License Plate"
        value={vehicle.plate}
        onChangeText={(val) => handleInputChange('plate', val)}
        autoCapitalize="characters"
      />
      {saving && <ActivityIndicator style={{ marginVertical: 10 }} />}
      <Button 
        title={ isEditing ? 'Update Vehicle' : ' Add Vehicle'}
        onPress={() => router.push('/(resident)/my-profile')} 
        variant="outline" 
        style={{ marginTop: 10 }} 
      />

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
};

export default VehicleModalScreen;
