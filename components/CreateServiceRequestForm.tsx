// @ts-nocheck
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Switch,
  Alert,
  Platform,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Button from '@/components/ui/Button';
import { useAuth, Vehicle } from '@/lib/providers/AuthProvider';
import { getFunctions, httpsCallable } from 'firebase/functions';
import {
  getPhoenixServices,
  PhoenixService,
} from '@/lib/services/phoenixService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/config/firebaseConfig';
import { Property } from '@/lib/providers/AuthProvider';
import DateTimePicker, {
  DateTimePickerEvent,
  DateTimePickerAndroid,
} from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { format, formatDistanceToNow, addMinutes } from 'date-fns';
import DropDownPicker from 'react-native-dropdown-picker';
import Badge from '@/components/ui/Badge';
import { useServiceRequest } from '@/lib/context/ServiceRequestContext';

type CreateServiceRequestFormProps = {
  onServiceRequestSubmitted: () => void;
  address: any;
};

const CreateServiceRequestForm = ({
  onServiceRequestSubmitted,
  address,
}: CreateServiceRequestFormProps) => {
  const { user, residentProfile } = useAuth();
  const { isOffPremise, setIsOffPremise } = useServiceRequest();
  const router = useRouter();
  const params = useLocalSearchParams();

  console.log(process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY);

  // Form State
  const [residentName, setResidentName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [arrivalTime, setArrivalTime] = useState(addMinutes(new Date(), 30));
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);
  const [serviceLocationObject, setServiceLocationObject] = useState<
    object | null
  >(null);
  const [propertyFullAddressString, setPropertyFullAddressString] =
    useState<string>('');
  const [isLoadingPropertyAddress, setIsLoadingPropertyAddress] =
    useState(true);
  const [propertyAddressError, setPropertyAddressError] = useState<
    string | null
  >(null);
  const [addressInput, setAddressInput] = useState('');
  const [phoenixServices, setPhoenixServices] = useState<PhoenixService[]>([]);
  const [selectedPhoenixServices, setSelectedPhoenixServices] = useState<
    number[]
  >([]);
  const [openServices, setOpenServices] = useState(false);
  const [openVehicles, setOpenVehicles] = useState(false);
  const [selectedVehiclePlate, setSelectedVehiclePlate] = useState<
    string | null
  >(null);

  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [residentNotes, setResidentNotes] = useState('');
  const [smsConsent, setSmsConsent] = useState(false);

  // UI State
  const [saving, setSaving] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState<string | null>(null);

  useEffect(() => {
    if (residentProfile?.phone) {
      setPhone(residentProfile.phone);
    }
  }, [residentProfile]);

  useEffect(() => {
    const fetchPropertyAddress = async () => {
      if (user?.organizationId && user.propertyId && !isOffPremise) {
        setIsLoadingPropertyAddress(true);
        setPropertyAddressError(null);
        try {
          const propertyDocRef = doc(
            db,
            'organizations',
            user.organizationId,
            'properties',
            user.propertyId
          );
          const propertyDocSnap = await getDoc(propertyDocRef);
          if (propertyDocSnap.exists()) {
            const propertyData = propertyDocSnap.data() as Property;
            if (propertyData.address) {
              const { street, city, state, zip } = propertyData.address;
              const fullAddress = `${street}, ${city}, ${state} ${zip}`;
              setPropertyFullAddressString(fullAddress);
              setAddressInput(fullAddress);
              setServiceLocationObject({
                address_1: street,
                city,
                state,
                zipcode: zip,
                fullAddress,
              });
            } else {
              setPropertyAddressError(
                'Property address is not available. Please enter manually.'
              );
            }
          } else {
            setPropertyAddressError(
              'Property details not found. Please enter address manually.'
            );
          }
        } catch (error) {
          console.error('Error fetching property address:', error);
          setPropertyAddressError(
            'Failed to load property address. Please enter manually.'
          );
        } finally {
          setIsLoadingPropertyAddress(false);
        }
      } else {
        setIsLoadingPropertyAddress(false);
      }
    };

    fetchPropertyAddress();
  }, [user, isOffPremise]);

  useEffect(() => {
    if (address) {
      const { lat, lng } = address.geometry.location;
      const components = address.address_components;
      let streetNumber = '';
      let route = '';
      let city = '';
      let state = '';
      let postalCode = '';
      let country = '';

      components.forEach((component: any) => {
        if (component.types.includes('street_number'))
          streetNumber = component.long_name;
        if (component.types.includes('route')) route = component.long_name;
        if (component.types.includes('locality')) city = component.long_name;
        if (component.types.includes('administrative_area_level_1'))
          state = component.short_name;
        if (component.types.includes('postal_code'))
          postalCode = component.long_name;
        if (component.types.includes('country'))
          country = component.short_name;
      });

      const addressObject = {
        address_1: `${streetNumber} ${route}`.trim(),
        city,
        state,
        zipcode: postalCode,
        country,
        fullAddress: address.formatted_address,
        latitude: lat,
        longitude: lng,
      };
      setServiceLocationObject(addressObject);
      setAddressInput(addressObject.fullAddress);
    }
  }, [address]);

  useEffect(() => {
    if (selectedVehiclePlate) {
      const vehicle = residentProfile?.vehicles?.find(
        (v) => v.plate === selectedVehiclePlate
      );
      setSelectedVehicle(vehicle || null);
    } else {
      setSelectedVehicle(null);
    }
  }, [selectedVehiclePlate, residentProfile?.vehicles]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        console.log('Fetching Phoenix services...');
        setServicesLoading(true);
        const services = await getPhoenixServices();
        console.log('Fetched services:', { services });
        setPhoenixServices(services);
      } catch (err) {
        console.error('Failed to load service types:', err);
        setServicesError('Failed to load service types.');
      } finally {
        setServicesLoading(false);
        console.log('Service loading complete');
      }
    };
    fetchServices();
  }, []);

  const handleSubmit = async () => {
    if (!user || !user.organizationId || !user.propertyId) {
      Alert.alert('Error', 'Authentication details are missing.');
      return;
    }
    if (
      selectedPhoenixServices.length === 0 ||
      !serviceLocationObject ||
      !phone
    ) {
      Alert.alert(
        'Error',
        'Please fill out all required fields: Service Type, Location, and Phone.'
      );
      return;
    }

    setSaving(true);
    try {
      const functions = getFunctions();
      const createServiceRequest = httpsCallable(
        functions,
        'createServiceRequest'
      );

      const serviceTypesForSubmission = selectedPhoenixServices.map((id) => {
        const service = phoenixServices.find((s) => s.id === id);
        return { id: service?.id, value: service?.name };
      });

      const payload = {
        organizationId: user.organizationId,
        propertyId: user.propertyId,
        residentNotes: residentNotes.trim(),
        arrivalTime: arrivalTime.toISOString(),
        phone: phone.trim(),
        smsConsent,
        serviceLocationAddress: serviceLocationObject,
        serviceTypes: serviceTypesForSubmission,
        isOffPremiseRequest: isOffPremise,
        car_year: selectedVehicle?.year,
        car_make: selectedVehicle?.make,
        car_model: selectedVehicle?.model,
        car_color: selectedVehicle?.color,
      };

      await createServiceRequest(payload);
      Alert.alert('Success', 'Service request submitted successfully!');
      onServiceRequestSubmitted();
      // Clear form
      setSelectedPhoenixServices([]);
      setServiceLocationObject(null);
      setSelectedVehicle(null);
      setResidentNotes('');
      setSmsConsent(false);
      setArrivalTime(addMinutes(new Date(), 30));
    } catch (error) {
      console.error('Error submitting service request:', error);
      Alert.alert('Error', 'Failed to submit service request.');
    } finally {
      setSaving(false);
    }
  };

  const handleAppleDateTimeChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    const pickerIsCurrentlyVisible = showDateTimePicker;

    if (event.type === 'set' && selectedDate) {
      setArrivalTime(selectedDate);
    }
    if (pickerIsCurrentlyVisible) {
      setShowDateTimePicker(false);
    }
  };

  const handleAndroidTimeChange = (
    event: DateTimePickerEvent,
    selectedTime?: Date,
    dateFromPicker?: Date
  ) => {
    if (event.type === 'set' && selectedTime) {
      const finalArrivalTime = new Date(dateFromPicker || arrivalTime);
      finalArrivalTime.setHours(selectedTime.getHours());
      finalArrivalTime.setMinutes(selectedTime.getMinutes());
      finalArrivalTime.setSeconds(0);
      finalArrivalTime.setMilliseconds(0);
      setArrivalTime(finalArrivalTime);
    }
  };

  const handleAndroidDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    if (event.type === 'set' && selectedDate) {
      const newArrivalTime = new Date(arrivalTime);
      newArrivalTime.setFullYear(selectedDate.getFullYear());
      newArrivalTime.setMonth(selectedDate.getMonth());
      newArrivalTime.setDate(selectedDate.getDate());
      setArrivalTime(newArrivalTime);

      DateTimePickerAndroid.open({
        mode: 'time',
        value: newArrivalTime,
        onChange: (event, time) =>
          handleAndroidTimeChange(event, time, newArrivalTime),
        is24Hour: false,
      });
    }
  };

  const openDateTimePicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        mode: 'date',
        value: arrivalTime,
        onChange: handleAndroidDateChange,
      });
    } else if (Platform.OS === 'ios') {
      setShowDateTimePicker(true);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps='handled'>
      <Text style={styles.label}>Name</Text>
      <TextInput style={styles.input} value={residentName} editable={false} />

      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} value={email} editable={false} />

      <Text style={styles.label}>Contact Phone</Text>
      <TextInput
        style={styles.input}
        placeholder='Your contact phone number'
        value={phone}
        onChangeText={setPhone}
        keyboardType='phone-pad'
      />

      <Text style={styles.label}>Service Date & Time</Text>
      <TouchableOpacity onPress={openDateTimePicker}>
        <Text style={styles.input}>
          {format(arrivalTime, 'MM/dd/yyyy hh:mm a')}
        </Text>
      </TouchableOpacity>
      <Text style={styles.subText}>
        {formatDistanceToNow(arrivalTime, { addSuffix: true })}
      </Text>
      {Platform.OS === 'ios' && showDateTimePicker && (
        <DateTimePicker
          value={arrivalTime}
          mode='datetime'
          display='default'
          onChange={handleAppleDateTimeChange}
        />
      )}

      <Text style={styles.label}>Service Location</Text>

      {isOffPremise ? (
        <>
          <Button
            title="Search for Address"
            onPress={() => router.push('/service-request/address-search')}
          />
          {address && (
            <View style={styles.addressContainer}>
              <Text>{address.formatted_address}</Text>
            </View>
          )}
        </>
      ) : (
        <View>
          {isLoadingPropertyAddress ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.input}>{addressInput}</Text>
          )}
        </View>
      )}

      <View style={styles.switchContainer}>
        <Text style={styles.caption}>Request service at a different address?</Text>
        <Switch
          onValueChange={(value) => {
            setIsOffPremise(value);
            if (value) {
              setServiceLocationObject(null);
              setAddressInput('');
            }
          }}
          value={isOffPremise}
        />
      </View>

      <Text style={styles.label}>Service Type</Text>
      <DropDownPicker
        open={openServices}
        value={selectedPhoenixServices}
        items={phoenixServices.map((s) => ({
          label: s.name,
          value: s.id,
        }))}
        setOpen={setOpenServices}
        setValue={setSelectedPhoenixServices}
        multiple={true}
        mode='BADGE'
        min={1}
        placeholder='Select a service'
        listMode='MODAL'
        renderBadgeItem={(item) => (
          <Badge
            label={item.label}
            onPress={() => {
              setSelectedPhoenixServices(
                selectedPhoenixServices.filter((id) => id !== item.value)
              );
            }}
          />
        )}
        modalProps={{
          animationType: 'fade',
        }}
      />

      {residentProfile &&
        residentProfile.vehicles &&
        residentProfile.vehicles.length > 0 && (
          <>
            <Text style={styles.label}>Select Vehicle</Text>
            <DropDownPicker
              open={openVehicles}
              value={selectedVehiclePlate}
              items={residentProfile.vehicles.map((v, index) => ({
                label: `${v.year} ${v.make} ${v.model}`,
                value: v.plate || index.toString(),
              }))}
              setOpen={setOpenVehicles}
              setValue={setSelectedVehiclePlate}
              placeholder='Select your vehicle'
              listMode='MODAL'
              modalProps={{
                animationType: 'fade',
              }}
            />
          </>
        )}

      <Text style={styles.label}>Additional Notes</Text>
      <TextInput
        style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
        placeholder='e.g., vehicle make/model, specific issue details'
        value={residentNotes}
        onChangeText={setResidentNotes}
        multiline
        numberOfLines={4}
      />

      <View style={styles.switchContainer}>
        <Text style={styles.label}>Consent to SMS Updates</Text>
        <Switch onValueChange={setSmsConsent} value={smsConsent} />
      </View>

      <Button
        title={saving ? 'Submitting...' : 'Submit Request'}
        onPress={handleSubmit}
        disabled={saving}
        style={{ marginTop: 20 }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  addressContainer: {
    marginTop: 10,
    padding: 10,
    paddingVertical: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  addressTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 10,
  },
  container: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
    marginTop: 15,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  suggestionsContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginTop: 5,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  listView: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    borderRadius: 5,
    marginTop: 5,
  },
  row: {
    padding: 10,
    height: 44,
    flexDirection: 'row',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
  },
  dropdown: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: 'white',
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});

export default CreateServiceRequestForm;
