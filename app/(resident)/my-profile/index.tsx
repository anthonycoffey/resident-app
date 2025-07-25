import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { View, Text, useThemeColor } from '@/components/Themed';
import { Link } from 'expo-router';
import { getFunctions, httpsCallable } from 'firebase/functions';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Divider from '@/components/ui/Divider';
import { MaterialIcons } from '@expo/vector-icons';
import { useProfile } from '@/lib/context/ProfileContext';

const MyProfileScreenContent = () => {
  const {
    residentData,
    vehicles,
    loading,
    error,
    setResidentData,
    deleteVehicle,
  } = useProfile();

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const textColor = useThemeColor({}, 'text');
  const labelColor = useThemeColor({}, 'label');
  const primaryColor = useThemeColor({}, 'primary');
  const errorColor = useThemeColor({}, 'error');
  const dividerColor = useThemeColor({}, 'divider');

  const formatPhoneNumberOnInput = (value: string): string => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(
      3,
      6
    )}-${phoneNumber.slice(6, 10)}`;
  };

  const handleInputChange = (name: keyof typeof residentData, value: string) => {
    if (name === 'phone') {
      setResidentData({ ...residentData, [name]: formatPhoneNumberOnInput(value) });
    } else {
      setResidentData({ ...residentData, [name]: value });
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const functions = getFunctions();
      const updateResidentProfileCallable = httpsCallable(functions, 'updateResidentProfile');
      
      // Vehicles are now saved from the context, so we only need to save resident data here.
      const payload = {
        ...residentData,
      };

      await updateResidentProfileCallable(payload);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile.';
      setSaveError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVehicle = (indexToDelete: number) => {
    Alert.alert(
      'Delete Vehicle',
      'Are you sure you want to delete this vehicle?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteVehicle(indexToDelete);
            } catch (error) {
              const message = error instanceof Error ? error.message : 'An unknown error occurred.';
              Alert.alert('Delete Failed', message);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={primaryColor} />
      </View>
    );
  }

  const renderHeader = () => (
    <View style={{ backgroundColor: 'transparent' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15, backgroundColor: 'transparent' }}>
        <MaterialIcons name="person" size={24} color={textColor} />
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginLeft: 10 }}>My Profile</Text>
      </View>
      {error && <Text style={{ color: errorColor, marginBottom: 10, textAlign: 'center' }}>{error}</Text>}
      {saveError && <Text style={{ color: errorColor, marginBottom: 10, textAlign: 'center' }}>{saveError}</Text>}
      <Text style={{ fontSize: 16, fontWeight: '500', marginBottom: 5, color: labelColor }}>Full Name</Text>
      <Input
        placeholder="Full Name"
        value={residentData.displayName || ''}
        onChangeText={(val: string) => handleInputChange('displayName', val)}
      />
      <Text style={{ fontSize: 16, fontWeight: '500', marginBottom: 5, color: labelColor }}>Email Address</Text>
      <Input
        placeholder="Email Address"
        value={residentData.email || ''}
        editable={false}
      />
      <Text style={{ fontSize: 16, fontWeight: '500', marginBottom: 5, color: labelColor }}>Phone Number</Text>
      <Input
        placeholder="Phone Number"
        value={residentData.phone || ''}
        onChangeText={(val: string) => handleInputChange('phone', val)}
        keyboardType="phone-pad"
      />
      <Text style={{ fontSize: 16, fontWeight: '500', marginBottom: 5, color: labelColor }}>Unit Number</Text>
      <Input
        placeholder="Unit Number"
        value={residentData.unitNumber || ''}
        editable={false}
      />
      <Divider style={{ marginVertical: 20 }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15, backgroundColor: 'transparent' }}>
        <MaterialIcons name="directions-car" size={24} color={textColor} />
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginLeft: 10 }}>Vehicle Information</Text>
      </View>
    </View>
  );

  const renderFooter = () => (
    <View style={{ backgroundColor: 'transparent' }}>
      {vehicles.length < 2 && (
        <Link href="/my-profile/vehicle-modal" asChild>
          <Button
            title="Add Vehicle"
            onPress={() => {}}
            variant="outline"
            style={{ marginTop: 10 }}
          />
        </Link>
      )}
      <Button
        title={saving ? 'Saving...' : 'Save Profile'}
        style={{ marginTop: 10 }}
        onPress={handleSaveProfile}
        disabled={saving}
      />
    </View>
  );

  return (
    <ScrollView style={{ flex: 1 }}>
      <Card>
        {renderHeader()}
        {vehicles.length === 0 ? (
          <Text style={{ textAlign: 'center', marginVertical: 20, color: labelColor }}>No vehicles added.</Text>
        ) : (
          vehicles.map((item, index) => (
            <View key={`${item.plate}-${index}`} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: dividerColor, backgroundColor: 'transparent' }}>
              <View style={{ backgroundColor: 'transparent' }}>
                <Text style={{ fontSize: 16, fontWeight: '500' }}>{`${item.year} ${item.color} ${item.make} ${item.model}`}</Text>
                <Text style={{ fontSize: 14, color: labelColor }}>{`Plate: ${item.plate}`}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15, backgroundColor: 'transparent' }}>
                <Link href={{ pathname: "/my-profile/vehicle-modal", params: { index: index.toString() } }} asChild>
                  <TouchableOpacity>
                    <MaterialIcons name="edit" size={24} color={primaryColor} />
                  </TouchableOpacity>
                </Link>
                <TouchableOpacity onPress={() => handleDeleteVehicle(index)}>
                  <MaterialIcons name="delete" size={24} color={errorColor} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
        {renderFooter()}
      </Card>
    </ScrollView>
  );
};

const MyProfileScreen = () => {
  const { fetchResidentData } = useProfile();

  useEffect(() => {
    fetchResidentData();
  }, [fetchResidentData]);

  return <MyProfileScreenContent />;
};

export default MyProfileScreen;
