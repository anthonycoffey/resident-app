import React, { useState, useEffect } from 'react';
import { Platform, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Text, View, useThemeColor } from '@/components/Themed';
import { useProfile } from '@/lib/context/ProfileContext';
import { MaterialIcons } from '@expo/vector-icons';
import { Vehicle } from '@/lib/types/resident';

const VehicleModalScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { residentData, addVehicle, updateVehicle, loading } = useProfile();
  const primaryColor = useThemeColor({}, 'primary');

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
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const saveVehicle = async () => {
    if (!vehicle.make || !vehicle.model || !vehicle.year || !vehicle.color || !vehicle.plate) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }
    setSaving(true);
    try {
      if (isEditing && index !== null) {
        await updateVehicle(vehicle, index);
      } else {
        const newIndex = await addVehicle(vehicle);
        router.setParams({ index: newIndex.toString() });
      }
      setIsDirty(false);
      router.push({
        pathname: '/my-profile',
        params: { vehicleSaved: 'true' },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred.';
      Alert.alert('Save Failed', message);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const vehicles = residentData?.vehicles || [];
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
  }, [params.index, residentData]);

  const handleInputChange = (name: keyof Vehicle, value: string) => {
    setIsDirty(true);
    setVehicle((prev) => ({
      ...prev,
      [name]: name === 'year' ? parseInt(value, 10) || 0 : name === 'plate' ? value.toUpperCase() : value,
    }));
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'transparent',
        }}
      >
        <ActivityIndicator size='large' color={primaryColor} />
      </View>
    );
  }

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
              <MaterialIcons name='arrow-back' size={24} />
            </TouchableOpacity>
          ),
        }}
      />
      <Text
        style={{
          fontSize: 24,
          fontWeight: 'bold',
          marginBottom: 20,
          textAlign: 'center',
        }}
      >
        {isEditing ? 'Edit Vehicle' : 'Add Vehicle'}
      </Text>
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
        title={saving ? 'Saving...' : isEditing ? 'Update Vehicle' : 'Add Vehicle'}
        onPress={saveVehicle}
        disabled={saving}
        style={{ marginTop: 20 }}
      />

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
};

export default VehicleModalScreen;
