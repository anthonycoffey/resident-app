import React, { useState, useEffect, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { View, Text, useThemeColor } from '@/components/Themed';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import {
  getAuth,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth';
import debounce from 'lodash.debounce';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Divider from '@/components/ui/Divider';
import Accordion from '@/components/ui/Accordion';
import Snackbar from '@/components/ui/Snackbar';
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
    updateProfile,
  } = useProfile();
  const params = useLocalSearchParams();
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [openSection, setOpenSection] = useState('profile');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (params.vehicleSaved === 'true') {
      setSnackbarVisible(true);
      const newParams = { ...params };
      delete newParams.vehicleSaved;
      router.replace({
        pathname: '/my-profile',
        params: newParams,
      });
    }
  }, [params.vehicleSaved, router]);

  const textColor = useThemeColor({}, 'text');
  const labelColor = useThemeColor({}, 'label');
  const primaryColor = useThemeColor({}, 'primary');
  const errorColor = useThemeColor({}, 'error');
  const dividerColor = useThemeColor({}, 'divider');

  const saveProfile = async (dataToSave: typeof residentData) => {
    setSaving(true);
    setSaveError(null);

    const minSpinnerTime = new Promise((resolve) => setTimeout(resolve, 1000));
    const saveData = new Promise(async (resolve, reject) => {
      try {
        await updateProfile(dataToSave);
        resolve(true);
      } catch (err) {
        reject(err);
      }
    });

    try {
      await Promise.all([saveData, minSpinnerTime]);
      setIsDirty(false);
      setSnackbarVisible(true);
    } catch (err) {
      console.error('Error updating profile:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to update profile.';
      setSaveError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const debouncedSave = useCallback(debounce(saveProfile, 1500), []);

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

  const handleInputChange = (
    name:
      | keyof Omit<typeof residentData, 'address'>
      | keyof NonNullable<(typeof residentData)['address']>,
    value: string
  ) => {
    setIsDirty(true);
    let updatedData;
    if (name === 'phone') {
      updatedData = { ...residentData, phone: formatPhoneNumberOnInput(value) };
    } else if (
      ['street', 'city', 'state', 'zip', 'unit'].includes(name as string)
    ) {
      let processedValue = value;
      if (name === 'state') {
        processedValue = value.toUpperCase();
      }
      if (name === 'zip') {
        processedValue = value.replace(/[^\d]/g, '');
      }
      updatedData = {
        ...residentData,
        address: {
          ...(residentData.address || {
            street: '',
            city: '',
            state: '',
            zip: '',
          }),
          [name]: processedValue,
        },
      };
    } else {
      updatedData = {
        ...residentData,
        [name as keyof typeof residentData]: value,
      };
    }
    setResidentData(updatedData);
    debouncedSave(updatedData);
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      Alert.alert('Error', 'Both current and new passwords are required.');
      return;
    }

    setIsChangingPassword(true);
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user || !user.email) {
      Alert.alert('Error', 'Could not find user information.');
      setIsChangingPassword(false);
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, oldPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      Alert.alert('Success', 'Your password has been updated successfully.');
      setOldPassword('');
      setNewPassword('');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'An unknown error occurred.';
      Alert.alert('Error', message);
    } finally {
      setIsChangingPassword(false);
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
              setSnackbarVisible(true);
            } catch (error) {
              const message =
                error instanceof Error
                  ? error.message
                  : 'An unknown error occurred.';
              Alert.alert('Delete Failed', message);
            }
          },
        },
      ]
    );
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
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }}>
        <Card>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 15,
              backgroundColor: 'transparent',
            }}
          >
            <MaterialIcons name='person' size={24} color={textColor} />
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginLeft: 10 }}>
              Edit Profile
            </Text>
          </View>
          {error && (
            <Text
              style={{
                color: errorColor,
                marginBottom: 10,
                textAlign: 'center',
              }}
            >
              {error}
            </Text>
          )}
          {saveError && (
            <Text
              style={{
                color: errorColor,
                marginBottom: 10,
                textAlign: 'center',
              }}
            >
              {saveError}
            </Text>
          )}

          <Accordion
            title='Personal Information'
            isOpen={openSection === 'profile'}
            onPress={() =>
              setOpenSection(openSection === 'profile' ? '' : 'profile')
            }
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: '500',
                marginBottom: 5,
                color: labelColor,
              }}
            >
              Full Name
            </Text>
            <Input
              placeholder='Full Name'
              value={residentData.displayName || ''}
              onChangeText={(val: string) =>
                handleInputChange('displayName', val)
              }
            />
            <Text
              style={{
                fontSize: 16,
                fontWeight: '500',
                marginBottom: 5,
                color: labelColor,
              }}
            >
              Email Address
            </Text>
            <Input
              placeholder='Email Address'
              value={residentData.email || ''}
              editable={false}
            />
            <Text
              style={{
                fontSize: 16,
                fontWeight: '500',
                marginBottom: 5,
                color: labelColor,
              }}
            >
              Phone Number
            </Text>
            <Input
              placeholder='Phone Number'
              value={residentData.phone || ''}
              onChangeText={(val: string) => handleInputChange('phone', val)}
              keyboardType='phone-pad'
            />
          </Accordion>

          <Accordion
            title='Address'
            isOpen={openSection === 'address'}
            onPress={() =>
              setOpenSection(openSection === 'address' ? '' : 'address')
            }
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: '500',
                marginBottom: 5,
                color: labelColor,
              }}
            >
              Street
            </Text>
            <Input
              placeholder='Street'
              value={residentData.address?.street || ''}
              onChangeText={(val: string) => handleInputChange('street', val)}
            />
            <Text
              style={{
                fontSize: 16,
                fontWeight: '500',
                marginBottom: 5,
                color: labelColor,
              }}
            >
              Unit (Optional)
            </Text>
            <Input
              placeholder='Unit'
              value={residentData.address?.unit || ''}
              onChangeText={(val: string) => handleInputChange('unit', val)}
            />
            <Text
              style={{
                fontSize: 16,
                fontWeight: '500',
                marginBottom: 5,
                color: labelColor,
              }}
            >
              City
            </Text>
            <Input
              placeholder='City'
              value={residentData.address?.city || ''}
              onChangeText={(val: string) => handleInputChange('city', val)}
            />
            <Text
              style={{
                fontSize: 16,
                fontWeight: '500',
                marginBottom: 5,
                color: labelColor,
              }}
            >
              State
            </Text>
            <Input
              placeholder='State'
              value={residentData.address?.state || ''}
              onChangeText={(val: string) => handleInputChange('state', val)}
              maxLength={2}
              autoCapitalize='characters'
            />
            <Text
              style={{
                fontSize: 16,
                fontWeight: '500',
                marginBottom: 5,
                color: labelColor,
              }}
            >
              Zip Code
            </Text>
            <Input
              placeholder='Zip Code'
              value={residentData.address?.zip || ''}
              onChangeText={(val: string) => handleInputChange('zip', val)}
              keyboardType='numeric'
              maxLength={5}
            />
          </Accordion>

          <Accordion
            title='Vehicles'
            isOpen={openSection === 'vehicles'}
            onPress={() =>
              setOpenSection(openSection === 'vehicles' ? '' : 'vehicles')
            }
          >
            {vehicles.length === 0 ? (
              <Text
                style={{
                  textAlign: 'center',
                  marginVertical: 20,
                  color: labelColor,
                }}
              >
                No vehicles added.
              </Text>
            ) : (
              vehicles.map((item, index) => (
                <View
                  key={`${item.plate}-${index}`}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingVertical: 10,
                    borderBottomWidth: 1,
                    borderBottomColor: dividerColor,
                    backgroundColor: 'transparent',
                  }}
                >
                  <View style={{ backgroundColor: 'transparent' }}>
                    <Text
                      style={{ fontSize: 16, fontWeight: '500' }}
                    >{`${item.year} ${item.color} ${item.make} ${item.model}`}</Text>
                    <Text
                      style={{ fontSize: 14, color: labelColor }}
                    >{`Plate: ${item.plate}`}</Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 15,
                      backgroundColor: 'transparent',
                    }}
                  >
                    <Link
                      href={{
                        pathname: '/my-profile/vehicle-modal',
                        params: { index: index.toString() },
                      }}
                      asChild
                    >
                      <TouchableOpacity>
                        <MaterialIcons
                          name='edit'
                          size={24}
                          color={primaryColor}
                        />
                      </TouchableOpacity>
                    </Link>
                    <TouchableOpacity
                      onPress={() => handleDeleteVehicle(index)}
                    >
                      <MaterialIcons
                        name='delete'
                        size={24}
                        color={errorColor}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
            {vehicles.length < 2 && (
              <Link href='/my-profile/vehicle-modal' asChild>
                <Button
                  title='Add Vehicle'
                  onPress={() => {}}
                  variant='outline'
                  style={{ marginTop: 10 }}
                />
              </Link>
            )}
          </Accordion>
          {saving && (
            <View
              style={{
                marginTop: 16,
                alignItems: 'center',
                backgroundColor: 'transparent',
              }}
            >
              <ActivityIndicator size='large' />
            </View>
          )}
        </Card>
        <Card>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 15,
              backgroundColor: 'transparent',
            }}
          >
            <MaterialIcons name='lock' size={24} color={textColor} />
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginLeft: 10 }}>
              Change Password
            </Text>
          </View>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '500',
              marginBottom: 5,
              color: labelColor,
            }}
          >
            Current Password
          </Text>
          <Input
            placeholder='Current Password'
            value={oldPassword}
            onChangeText={setOldPassword}
            secureTextEntry
          />
          <Text
            style={{
              fontSize: 16,
              fontWeight: '500',
              marginBottom: 5,
              color: labelColor,
            }}
          >
            New Password
          </Text>
          <Input
            placeholder='New Password'
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!isPasswordVisible}
            rightIcon={
              <MaterialIcons
                name={isPasswordVisible ? 'visibility-off' : 'visibility'}
                size={24}
                color={textColor}
              />
            }
            onRightIconPress={() => setIsPasswordVisible(!isPasswordVisible)}
          />
          <Button
            title={isChangingPassword ? 'Changing...' : 'Change Password'}
            onPress={handleChangePassword}
            disabled={isChangingPassword}
            style={{ marginTop: 10 }}
          />
        </Card>
      </ScrollView>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        message='Success!'
      />
    </SafeAreaView>
  );
};

export default MyProfileScreenContent;
