import { doc, setDoc } from 'firebase/firestore';
import * as Notifications from 'expo-notifications';
import { db } from '../config/firebaseConfig';
import { useAuth } from '../providers/AuthProvider';

export const registerForPushNotificationsAsync = async (userId: string, organizationId: string, propertyId: string) => {
  let token;
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);

    // /organizations/pNcRD7xrbvCaKNBWSsCV/properties/Rf9JElhXesRAaWB7JxNC/residents/aPprmEV5XXEIgxIVye0ZNP8ejU3L
    if (token) {
      const userDocRef = doc(
        db,
        'organizations',
        organizationId,
        'properties',
        propertyId,
        'residents',
        userId
      );
      await setDoc(userDocRef, { expoPushToken: token }, { merge: true });
    }
  } catch (error) {
    console.error('Error registering for push notifications:', error);
  }

  return token;
};
