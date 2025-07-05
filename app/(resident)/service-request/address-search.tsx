import React, { useRef } from 'react';
import { SafeAreaView, Keyboard, TouchableOpacity } from 'react-native';
import { View, useThemeColor } from '@/components/Themed';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useServiceRequest } from '@/lib/context/ServiceRequestContext';

const AddressSearchScreen = () => {
  const router = useRouter();
  const { setAddress } = useServiceRequest();
  const googlePlacesAutocompleteRef = useRef<any>(null);

  const backgroundColor = useThemeColor({}, 'background');
  const inputBackgroundColor = useThemeColor({}, 'input');
  const textColor = useThemeColor({}, 'text');
  const placeholderColor = useThemeColor({}, 'label');
  const dividerColor = useThemeColor({}, 'divider');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }}>
      <View style={{ flex: 1, padding: 15, backgroundColor: 'transparent' }}>
        <GooglePlacesAutocomplete
          ref={googlePlacesAutocompleteRef}
          placeholder='Search for an address'
          textInputProps={{
            placeholderTextColor: placeholderColor,
            clearButtonMode: 'always',
            style: {
              backgroundColor: inputBackgroundColor,
              color: textColor,
              paddingVertical: 10,
              borderRadius: 8,
              paddingHorizontal: 12,
              fontSize: 16,
              borderWidth: 1,
              borderColor: dividerColor,
              flex: 1,
            },
          }}
          styles={{
            textInputContainer: {
              width: '100%',
            },
            listView: {
              borderWidth: 1,
              borderColor: dividerColor,
              backgroundColor: inputBackgroundColor,
              borderRadius: 8,
              marginTop: 10,
            },
            row: {
              backgroundColor: 'transparent',
            },
            description: {
              color: textColor,
            },
            separator: {
              height: 1,
              backgroundColor: dividerColor,
            },
          }}
          onPress={(_data, details = null) => {
            /* clear search */
            Keyboard.dismiss();
            setAddress(details);
            router.replace({
              pathname: '/(resident)/service-request',
            });
          }}
          query={{
            key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
            language: 'en',
            components: 'country:us',
          }}
          enablePoweredByContainer={false}
          predefinedPlaces={[]}
          autoFillOnNotFound={false}
          currentLocation={false}
          currentLocationLabel='Current location'
          debounce={200}
          disableScroll={false}
          enableHighAccuracyLocation={true}
          fetchDetails={true}
          filterReverseGeocodingByTypes={[]}
          GooglePlacesDetailsQuery={{}}
          GooglePlacesSearchQuery={{
            rankby: 'distance',
          }}
          GoogleReverseGeocodingQuery={{}}
          isRowScrollable={true}
          keyboardShouldPersistTaps='always'
          listHoverColor='#ececec'
          listUnderlayColor='#c8c7cc'
          listViewDisplayed='auto'
          keepResultsAfterBlur={false}
          minLength={2}
          nearbyPlacesAPI='GooglePlacesSearch'
          numberOfLines={1}
          onFail={(e) => {
            console.warn('Google Place Failed : ', e);
          }}
          onNotFound={() => {}}
          onTimeout={() =>
            console.warn('google places autocomplete: request timeout')
          }
          predefinedPlacesAlwaysVisible={false}
          suppressDefaultStyles={false}
          textInputHide={false}
          timeout={20000}
          renderRightButton={() => (
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 10,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  googlePlacesAutocompleteRef.current?.setAddressText('');
                }}
              >
                <MaterialIcons
                  name='close'
                  size={20}
                  color={placeholderColor}
                />
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

export default AddressSearchScreen;
