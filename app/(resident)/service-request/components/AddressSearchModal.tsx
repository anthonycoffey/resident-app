import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Modal,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Text, View, useThemeColor } from '@/components/Themed';
import Button from '@/components/ui/Button';
import * as Crypto from 'expo-crypto';

// Custom hook for debouncing
function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const callbackRef = useRef<T>(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useMemo(() => {
    let timerId: any = null;
    return (...args: Parameters<T>) => {
      if (timerId) {
        clearTimeout(timerId);
      }
      timerId = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    };
  }, [delay]);
}

type AddressSearchModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelectAddress: (address: any, serviceLocationObject: object) => void;
};

const AddressSearchModal = ({
  visible,
  onClose,
  onSelectAddress,
}: AddressSearchModalProps) => {
  const textColor = useThemeColor({}, 'text');
  const inputBackgroundColor = useThemeColor({}, 'input');
  const dividerColor = useThemeColor({}, 'divider');
  const labelColor = useThemeColor({}, 'label');

  const [addressInput, setAddressInput] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [isFetchingAddressSuggestions, setIsFetchingAddressSuggestions] =
    useState(false);
  const [placesSessionToken, setPlacesSessionToken] = useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    if (visible) {
      setPlacesSessionToken(Crypto.randomUUID());
    } else {
      setPlacesSessionToken(undefined);
    }
  }, [visible]);

  const fetchAddressSuggestionsCore = useCallback(
    async (input: string) => {
      if (
        !input ||
        input.trim().length < 3 ||
        !process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
        !placesSessionToken
      ) {
        setAddressSuggestions([]);
        setIsFetchingAddressSuggestions(false);
        return;
      }
      setIsFetchingAddressSuggestions(true);
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        input
      )}&key=${
        process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
      }&components=country:us&sessiontoken=${placesSessionToken}`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.predictions) {
          setAddressSuggestions(data.predictions);
        } else {
          setAddressSuggestions([]);
        }
      } catch (error) {
        console.log('Failed to fetch address suggestions:', error);
        setAddressSuggestions([]);
      } finally {
        setIsFetchingAddressSuggestions(false);
      }
    },
    [placesSessionToken]
  );

  const debouncedFetchAddressSuggestions = useDebounce(
    fetchAddressSuggestionsCore,
    700
  );

  const handleAddressInputChange = (text: string) => {
    setAddressInput(text);
    debouncedFetchAddressSuggestions(text);
  };

  const handleSelectAddressSuggestion = async (suggestion: any) => {
    if (
      !process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
      !placesSessionToken ||
      !suggestion.place_id
    ) {
      Alert.alert('Error', 'Could not get address details.');
      return;
    }
    setAddressInput(suggestion.description);
    setAddressSuggestions([]);
    setIsFetchingAddressSuggestions(true);

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${
      suggestion.place_id
    }&key=${
      process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
    }&fields=address_component,formatted_address,geometry&sessiontoken=${placesSessionToken}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.result && data.result.address_components) {
        const details = data.result;
        const { lat, lng } = details.geometry.location;
        const components = details.address_components;
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
          if (component.types.includes('locality'))
            city = component.long_name;
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
          fullAddress: details.formatted_address,
          latitude: lat,
          longitude: lng,
        };
        onSelectAddress(details, addressObject);
        setPlacesSessionToken(Crypto.randomUUID());
      } else {
        Alert.alert('Error', 'Could not retrieve address details.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to retrieve address details.');
    } finally {
      setIsFetchingAddressSuggestions(false);
    }
  };

  return (
    <Modal
      animationType='slide'
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalCenteredView}>
        <View
          style={[
            styles.modalView,
            { backgroundColor: useThemeColor({}, 'background') },
          ]}
        >
          <Text style={[styles.modalTitle, { color: textColor }]}>
            Search for an Address
          </Text>
          <TextInput
            style={[
              styles.modalInput,
              {
                backgroundColor: inputBackgroundColor,
                color: textColor,
                borderColor: dividerColor,
              },
            ]}
            placeholder='Start typing address...'
            placeholderTextColor={labelColor}
            value={addressInput}
            onChangeText={handleAddressInputChange}
            autoFocus
          />
          {isFetchingAddressSuggestions && (
            <ActivityIndicator style={{ marginVertical: 10 }} />
          )}
          <FlatList
            data={addressSuggestions}
            keyExtractor={(item) => item.place_id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.suggestionItem,
                  { borderBottomColor: dividerColor },
                ]}
                onPress={() => handleSelectAddressSuggestion(item)}
              >
                <Text style={{ color: textColor }}>{item.description}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              !isFetchingAddressSuggestions && addressInput.length > 2 ? (
                <Text
                  style={{
                    color: textColor,
                    textAlign: 'center',
                    marginVertical: 10,
                  }}
                >
                  No results found.
                </Text>
              ) : null
            }
            style={{ maxHeight: 300 }}
            keyboardShouldPersistTaps='handled'
          />
          <Button
            title='Close'
            onPress={onClose}
            style={{ marginTop: 15 }}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalCenteredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    borderRadius: 10,
    padding: 25,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    width: '100%',
    marginBottom: 10,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
  },
});

export default AddressSearchModal;
