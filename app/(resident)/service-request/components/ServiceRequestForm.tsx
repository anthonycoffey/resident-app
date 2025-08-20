import React, { useState, useEffect } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Text, View, useThemeColor } from '@/components/Themed';
import { MaterialIcons } from '@expo/vector-icons';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/lib/providers/AuthProvider';
import { Vehicle } from '@/lib/types/resident';
import {
  getPhoenixServices,
  PhoenixService,
} from '@/lib/services/phoenixService';
import { useProfile } from '@/lib/context/ProfileContext';
import DateTimePicker, {
  DateTimePickerEvent,
  DateTimePickerAndroid,
} from '@react-native-community/datetimepicker';
import { format, formatDistanceToNow, addMinutes } from 'date-fns';
import ThemedDropDownPicker from '@/components/ui/DropDownPicker';
import { Dropdown } from 'react-native-element-dropdown';
import Badge from '@/components/ui/Badge';
import { useSubmitServiceRequest } from '@/lib/hooks/useSubmitServiceRequest';
import AddressSearchModal from './AddressSearchModal';

type Journey = 'on-premise' | 'off-premise';

interface AddressObject {
  address_1?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  country?: string;
  fullAddress?: string;
  latitude?: number;
  longitude?: number;
}

type ServiceRequestFormProps = {
  journey: Journey;
  onBack: () => void;
};

const ServiceRequestForm = ({ journey, onBack }: ServiceRequestFormProps) => {
  const { user } = useAuth();
  const { residentData: residentProfile } = useProfile();

  // Theme Colors
  const iconColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const labelColor = useThemeColor({}, 'label');
  const textColor = useThemeColor({}, 'text');
  const inputBackgroundColor = useThemeColor({}, 'input');
  const dividerColor = useThemeColor({}, 'divider');
  const readOnlyBackgroundColor = useThemeColor({}, 'readOnlyBackground');
  const colorScheme =
    useThemeColor({}, 'background') === '#000000' ? 'dark' : 'light';

  const [residentName] = useState(user?.displayName || '');
  const [email] = useState(user?.email || '');
  const [phone, setPhone] = useState(residentProfile?.phone || '');
  const [arrivalTime, setArrivalTime] = useState(new Date());
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);
  const [serviceLocationObject, setServiceLocationObject] = useState<
    object | null
  >(null);
  const [phoenixServices, setPhoenixServices] = useState<PhoenixService[]>([]);
  const [selectedPhoenixServices, setSelectedPhoenixServices] = useState<
    number[]
  >([]);
  const [openServices, setOpenServices] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [residentNotes, setResidentNotes] = useState('');
  const [smsConsent, setSmsConsent] = useState(false);

  // On-Premise State
  const [propertyFullAddressString, setPropertyFullAddressString] =
    useState<string>('');
  const [isLoadingPropertyAddress, setIsLoadingPropertyAddress] =
    useState(true);

  // Off-Premise State
  const [address, setAddress] = useState<any>(null);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [offPremiseStreet, setOffPremiseStreet] = useState('');
  const [offPremiseUnit, setOffPremiseUnit] = useState('');
  const [offPremiseCity, setOffPremiseCity] = useState('');
  const [offPremiseState, setOffPremiseState] = useState('');
  const [offPremiseZip, setOffPremiseZip] = useState('');

  // UI State
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState<string | null>(null);

  const { submitRequest, saving } = useSubmitServiceRequest(
    phoenixServices,
    () => {
      handleServiceRequestSubmitted();
    }
  );

  const handleServiceRequestSubmitted = () => {
    console.log('Service request submitted successfully from the screen.');
    onBack(); // Reset to selection screen
    // Clear form
    setSelectedPhoenixServices([]);
    setSelectedVehicle(null);
    setResidentNotes('');
    setSmsConsent(false);
    setArrivalTime(addMinutes(new Date(), 30));
    setAddress(null);
    setServiceLocationObject(null);
  };

  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (match) {
      let formatted = '';
      if (match[1]) {
        formatted += match[1];
      }
      if (match[2]) {
        formatted += `-${match[2]}`;
      }
      if (match[3]) {
        formatted += `-${match[3]}`;
      }
      setPhone(formatted);
    }
  };

  // On-Premise Logic
  useEffect(() => {
    if (journey === 'on-premise') {
      if (residentProfile?.address) {
        const { street, city, state, zip, unit } = residentProfile.address;
        const fullAddress = `${street}${
          unit ? ` ${unit}` : ''
        }, ${city}, ${state} ${zip}`;
        setPropertyFullAddressString(fullAddress);
        setServiceLocationObject({
          address_1: street,
          address_2: unit,
          city,
          state,
          zipcode: zip,
          fullAddress,
        });
      }
      setIsLoadingPropertyAddress(false);
    }
  }, [journey, residentProfile]);

  // Shared Logic
  useEffect(() => {
    if (residentProfile?.phone) {
      handlePhoneChange(residentProfile.phone);
    }
  }, [residentProfile]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setServicesLoading(true);
        const services = await getPhoenixServices();
        setPhoenixServices(services);
      } catch (err) {
        setServicesError('Failed to load service types.');
      } finally {
        setServicesLoading(false);
      }
    };
    fetchServices();
  }, []);

  const handleSubmit = () => {
    if (
      residentProfile?.vehicles &&
      residentProfile.vehicles.length > 0 &&
      !selectedVehicle
    ) {
      Alert.alert('Vehicle Required', 'Please select a vehicle to continue.');
      return;
    }
    let finalServiceLocationObject = serviceLocationObject;

    if (journey === 'off-premise') {
      if (
        !offPremiseStreet ||
        !offPremiseCity ||
        !offPremiseState ||
        !offPremiseZip
      ) {
        Alert.alert(
          'Missing Address Information',
          'Please fill in all required address fields to continue.'
        );
        return;
      }
      finalServiceLocationObject = {
        address_1: offPremiseStreet,
        address_2: offPremiseUnit,
        city: offPremiseCity,
        state: offPremiseState,
        zipcode: offPremiseZip,
        fullAddress: `${offPremiseStreet}${
          offPremiseUnit ? ` ${offPremiseUnit}` : ''
        }, ${offPremiseCity}, ${offPremiseState} ${offPremiseZip}`,
      };
    }

    submitRequest({
      residentNotes,
      serviceDateTime: arrivalTime,
      phone,
      smsConsent,
      serviceLocationAddress: finalServiceLocationObject,
      selectedPhoenixServices,
      isOffPremiseRequest: journey === 'off-premise',
      selectedVehicle,
    });
  };

  const handleAppleDateTimeChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    if (event.type === 'set' && selectedDate) {
      setArrivalTime(selectedDate);
    }
    setShowDateTimePicker(false);
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
    <>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <MaterialIcons name='arrow-back' size={24} color={iconColor} />
        <Text style={{ marginLeft: 5 }}>Back to Selection</Text>
      </TouchableOpacity>

      <Text style={[styles.label, { color: labelColor }]}>Name</Text>
      <Input value={residentName} editable={false} />

      <Text style={[styles.label, { color: labelColor }]}>Email</Text>
      <Input value={email} editable={false} />

      <Text style={[styles.label, { color: labelColor }]}>Contact Phone</Text>
      <Input
        placeholder='Your contact phone number'
        value={phone}
        onChangeText={handlePhoneChange}
        keyboardType='phone-pad'
        maxLength={12}
      />

      <Text style={[styles.label, { color: labelColor }]}>
        Service Date & Time
      </Text>
      <TouchableOpacity onPress={openDateTimePicker}>
        <View
          style={[
            styles.inputImitation,
            {
              backgroundColor: inputBackgroundColor,
              borderColor: dividerColor,
              justifyContent: 'center',
            },
          ]}
        >
          <Text style={{ color: textColor, textAlign: 'center' }}>
            {format(arrivalTime, 'MM/dd/yyyy hh:mm a')}
          </Text>
        </View>
      </TouchableOpacity>
      <Text style={[styles.subText, { color: labelColor }]}>
        {formatDistanceToNow(arrivalTime, { addSuffix: true })}
      </Text>
      {Platform.OS === 'ios' && showDateTimePicker && (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            padding: 10,
            backgroundColor: 'transparent',
          }}
        >
          <DateTimePicker
            value={arrivalTime}
            mode='datetime'
            display='default'
            onChange={handleAppleDateTimeChange}
            themeVariant={colorScheme}
          />
        </View>
      )}

      <Text style={[styles.label, { color: labelColor }]}>
        Service Location
      </Text>
      {journey === 'on-premise' && (
        <View style={{ backgroundColor: 'transparent' }}>
          {isLoadingPropertyAddress ? (
            <ActivityIndicator color={primaryColor} />
          ) : (
            <View
              style={[
                styles.readOnlyContainer,
                { backgroundColor: readOnlyBackgroundColor },
              ]}
            >
              <Text style={{ color: textColor }}>
                {propertyFullAddressString}
              </Text>
            </View>
          )}
        </View>
      )}
      {journey === 'off-premise' && (
        <>
          {address ? (
            <View style={{ backgroundColor: 'transparent' }}>
              <Text style={[styles.label, { color: labelColor }]}>Street</Text>
              <Input
                value={offPremiseStreet}
                onChangeText={setOffPremiseStreet}
                placeholder='Street Address'
              />
              <Text style={[styles.label, { color: labelColor }]}>Unit</Text>
              <Input
                value={offPremiseUnit}
                onChangeText={setOffPremiseUnit}
                placeholder='Apt, suite, etc. (optional)'
              />
              <Text style={[styles.label, { color: labelColor }]}>City</Text>
              <Input
                value={offPremiseCity}
                onChangeText={setOffPremiseCity}
                placeholder='City'
              />
              <View style={styles.row}>
                <View
                  style={{
                    flex: 1,
                    marginRight: 5,
                    backgroundColor: 'transparent',
                  }}
                >
                  <Text style={[styles.label, { color: labelColor }]}>
                    State
                  </Text>
                  <Input
                    value={offPremiseState}
                    onChangeText={setOffPremiseState}
                    placeholder='State'
                  />
                </View>
                <View
                  style={{
                    flex: 1,
                    marginLeft: 5,
                    backgroundColor: 'transparent',
                  }}
                >
                  <Text style={[styles.label, { color: labelColor }]}>
                    Zip Code
                  </Text>
                  <Input
                    value={offPremiseZip}
                    onChangeText={setOffPremiseZip}
                    placeholder='Zip Code'
                    keyboardType='numeric'
                  />
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setAddressModalVisible(true)}
                style={{ marginTop: 10 }}
              >
                <Text style={{ color: primaryColor, textAlign: 'center' }}>
                  Search for a different address
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Button
              title='Search for Address'
              onPress={() => setAddressModalVisible(true)}
            />
          )}
        </>
      )}

      <Text style={[styles.label, { color: labelColor }]}>Service Type</Text>
      <ThemedDropDownPicker
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

      {residentProfile?.vehicles && residentProfile.vehicles.length > 0 && (
        <>
          <Text style={[styles.label, { color: labelColor }]}>
            Select Vehicle
          </Text>
          <Dropdown
            style={[
              styles.dropdown,
              {
                backgroundColor: inputBackgroundColor,
                borderColor: dividerColor,
              },
            ]}
            placeholderStyle={[styles.placeholderStyle, { color: textColor }]}
            selectedTextStyle={[styles.selectedTextStyle, { color: textColor }]}
            inputSearchStyle={[
              styles.inputSearchStyle,
              { backgroundColor: inputBackgroundColor, color: textColor },
            ]}
            iconStyle={styles.iconStyle}
            data={residentProfile.vehicles.map((v) => ({
              ...v,
              label: `${v.year} ${v.make} ${v.model}`,
            }))}
            maxHeight={300}
            labelField='label'
            valueField='plate'
            placeholder='Select your vehicle'
            value={selectedVehicle}
            onChange={(item) => {
              setSelectedVehicle(item);
            }}
            renderLeftIcon={() => (
              <MaterialIcons
                style={styles.icon}
                color={iconColor}
                name='directions-car'
                size={20}
              />
            )}
            renderItem={(item) => (
              <View
                style={[
                  styles.item,
                  { backgroundColor: inputBackgroundColor },
                ]}
              >
                <Text style={[styles.textItem, { color: textColor }]}>
                  {`${item.year} ${item.make} ${item.model} - ${item.plate}`}
                </Text>
                {item.plate === selectedVehicle?.plate && (
                  <MaterialIcons
                    style={styles.icon}
                    color={iconColor}
                    name='check'
                    size={20}
                  />
                )}
              </View>
            )}
          />
        </>
      )}

      <Text style={[styles.label, { color: labelColor }]}>
        Additional Notes
      </Text>
      <Input
        // placeholder=''
        value={residentNotes}
        onChangeText={setResidentNotes}
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity
        style={[styles.switchContainer, { backgroundColor: 'transparent' }]}
        onPress={() => setSmsConsent(!smsConsent)}
      >
        <MaterialIcons
          name={smsConsent ? 'check-box' : 'check-box-outline-blank'}
          size={24}
          color={primaryColor}
        />
        <Text style={[styles.caption, { color: labelColor, marginLeft: 10 }]}>
          I consent to receive SMS updates for this service request.
        </Text>
      </TouchableOpacity>

      <Button
        title={saving ? 'Submitting...' : 'Submit Request'}
        onPress={handleSubmit}
        disabled={
          saving ||
          (residentProfile?.vehicles &&
            residentProfile.vehicles.length > 0 &&
            !selectedVehicle)
        }
        style={{ marginTop: 20 }}
      />

      <AddressSearchModal
        visible={addressModalVisible}
        onClose={() => setAddressModalVisible(false)}
        onSelectAddress={(details, addressObject: AddressObject) => {
          setAddress(details);
          setServiceLocationObject(addressObject);
          // Populate the new fields
          setOffPremiseStreet(addressObject.address_1 || '');
          setOffPremiseCity(addressObject.city || '');
          setOffPremiseState(addressObject.state || '');
          setOffPremiseZip(addressObject.zipcode || '');
          setOffPremiseUnit(''); // Reset unit as it's not provided by Google
          setAddressModalVisible(false);
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  dropdown: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    width: '100%',
  },
  icon: {
    marginRight: 5,
  },
  item: {
    padding: 17,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textItem: {
    flex: 1,
    fontSize: 16,
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
    borderRadius: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  inputImitation: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    width: '100%',
  },
  readOnlyContainer: {
    minHeight: 40,
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderRadius: 8,
  },
  addressContainer: {
    marginTop: 10,
    padding: 10,
    paddingVertical: 15,
    borderRadius: 5,
  },
  subText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
    marginTop: 15,
  },
  caption: {
    fontSize: 14,
    flex: 1,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
  },
});

export default ServiceRequestForm;
