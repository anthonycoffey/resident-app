import React, { useRef } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Keyboard,
  TouchableOpacity,
} from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const AddressSearchScreen = () => {
  const router = useRouter();
  const googlePlacesAutocompleteRef = useRef<any>(null);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <GooglePlacesAutocomplete
          ref={googlePlacesAutocompleteRef}
          placeholder='Search for an address'
          textInputProps={{
            placeholderTextColor: '#000',
            clearButtonMode: 'always',
          }}
          styles={{
            container: {
              flex: 1,
            },
            textInput: {
              backgroundColor: '#f0f0f0',
              borderRadius: 5,
              paddingVertical: 10,
              paddingHorizontal: 15,
              fontSize: 16,
            },
            listView: {
              borderWidth: 1,
              borderColor: '#ddd',
              backgroundColor: '#fff',
              borderRadius: 5,
              marginTop: 10,
            },
          }}
          onPress={(data, details = null) => {
            Keyboard.dismiss();
            router.replace({
              pathname: '/(resident)/service-request',
              params: { address: JSON.stringify(details) },
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
            <TouchableOpacity
              onPress={() => {
                googlePlacesAutocompleteRef.current?.clear();
              }}
              style={{ justifyContent: 'center', paddingHorizontal: 10 }}
            >
              <Ionicons name='close-circle' size={20} color='#888' />
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    padding: 15,
  },
});

export default AddressSearchScreen;
