import React, { use, useState, useRef } from 'react';
import {
  StyleSheet,
  Alert,
  Image,
  useColorScheme,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from 'expo-router';

import { View, Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/lib/providers/AuthProvider';
import { functions, storage } from '@/lib/config/firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { httpsCallable } from 'firebase/functions';
import { Dropdown } from 'react-native-element-dropdown';
import ViolationList, { ViolationListRef } from '@/components/ViolationList';

const ReportViolationScreen = () => {
  const violationListRef = useRef<ViolationListRef>(null);
  const navigation = useNavigation();
  const { user } = useAuth();
  const theme = useColorScheme() ?? 'light';
  const themeColors = Colors[theme];

  const [licensePlate, setLicensePlate] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [violationType, setViolationType] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const violationTypes = [
    { label: 'Unauthorized Parking', value: 'unauthorized_parking' },
    { label: 'Expired Registration', value: 'expired_registration' },
    { label: 'No Parking Permit', value: 'no_parking_permit' },
    { label: 'Other', value: 'other' },
  ];

  const handlePickImage = async (useCamera: boolean) => {
    const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
    const mediaLibraryStatus =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (
      cameraStatus.status !== 'granted' ||
      mediaLibraryStatus.status !== 'granted'
    ) {
      Alert.alert(
        'Permission required',
        'Sorry, we need camera and media library permissions to make this work!'
      );
      return;
    }

    const action = useCamera
      ? ImagePicker.launchCameraAsync
      : ImagePicker.launchImageLibraryAsync;

    let result = await action({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();

    const storageRef = ref(
      storage,
      `violations/${user?.claims.organizationId}/${
        user?.claims.propertyId
      }/${Date.now()}`
    );
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  };

  const handleSubmit = async () => {
    if (!licensePlate || !violationType || !image || !make || !model) {
      Alert.alert(
        'Missing Information',
        'Please fill out all fields and select an image.'
      );
      return;
    }

    if (!user?.claims.organizationId || !user?.claims.propertyId) {
      Alert.alert('Error', 'Could not identify your organization or property.');
      return;
    }

    setLoading(true);
    try {
      const photoUrl = await uploadImage(image);
      const createViolationReport = httpsCallable(
        functions,
        'createViolationReport'
      );

      const result = await createViolationReport({
        organizationId: user.claims.organizationId,
        propertyId: user.claims.propertyId,
        licensePlate,
        make,
        model,
        violationType,
        photoUrl,
        additionalInfo,
      });
      console.log('Violation report created:', result);

      Alert.alert('Success', 'Violation report submitted successfully.');
      setLicensePlate('');
      setMake('');
      setModel('');
      setAdditionalInfo('');
      setViolationType(null);
      setImage(null);
      violationListRef.current?.refresh();
    } catch (error) {
      console.error('Error submitting violation report:', error);
      Alert.alert('Error', 'There was a problem submitting your report.');
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <View>
      <Text
        style={{
          fontSize: 18,
          fontWeight: 'bold',
          marginHorizontal: 10,
          marginTop: 16,
          marginBottom: 4,
          color: themeColors.text,
        }}
      >
        Report Violation
      </Text>
      <Card>
        <Input
          placeholder='Enter License Plate'
          value={licensePlate}
          onChangeText={setLicensePlate}
          autoCapitalize='characters'
        />

        <Input
          placeholder='Enter Vehicle Make'
          value={make}
          onChangeText={setMake}
          autoCapitalize='words'
        />

        <Input
          placeholder='Enter Vehicle Model'
          value={model}
          onChangeText={setModel}
          autoCapitalize='words'
        />

        <Input
          placeholder='Additional Info (Optional)'
          value={additionalInfo}
          onChangeText={setAdditionalInfo}
          multiline
          numberOfLines={4}
          style={{ height: 100, textAlignVertical: 'top' }}
        />

        <Dropdown
          style={[
            styles.dropdown,
            {
              borderColor: themeColors.divider,
              backgroundColor: themeColors.input,
            },
          ]}
          placeholderStyle={{ color: themeColors.label }}
          selectedTextStyle={{ color: themeColors.text }}
          data={violationTypes}
          labelField='label'
          valueField='value'
          placeholder='Select Violation Type'
          value={violationType}
          onChange={(item) => {
            setViolationType(item.value);
          }}
        />

        <View style={styles.imageButtons}>
          <Button
            title='Take Photo'
            onPress={() => handlePickImage(true)}
            icon='photo-camera'
            variant='outline'
            style={styles.imageButton}
          />
          <Button
            title='Choose Photo'
            onPress={() => handlePickImage(false)}
            icon='photo-library'
            variant='outline'
            style={styles.imageButton}
          />
        </View>

        {image && <Image source={{ uri: image }} style={styles.imagePreview} />}

        <Button
          title='Submit Violation'
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.submitButton}
        />
      </Card>
    </View>
  );

  return (
    <ViolationList ref={violationListRef} ListHeaderComponent={renderHeader} />
  );
};

const styles = StyleSheet.create({
  dropdown: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  imageButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  imageButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 20,
  },
  submitButton: {
    marginTop: 20,
  },
});

export default ReportViolationScreen;
