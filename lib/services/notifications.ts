import { doc, setDoc, arrayUnion, getDoc } from 'firebase/firestore';
import messaging, {
  AuthorizationStatus,
  requestPermission,
  getToken,
} from '@react-native-firebase/messaging';
import { db } from '../config/firebaseConfig';
import { PermissionsAndroid, Platform } from 'react-native';

export const registerForPushNotificationsAsync = async (
  userId: string,
  organizationId: string,
  propertyId: string
) => {
  try {
    const message = messaging();
    // Request permission for iOS
    if (Platform.OS === 'ios') {
      const authStatus = await requestPermission(message);
      const enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.log('Authorization status:', authStatus);
        alert('Failed to get permission for push notification!');
        return;
      }
    } else if (Platform.OS === 'android') {
      // Request permission for Android (API 33+)
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      if (result !== 'granted') {
        alert('Failed to get permission for push notification!');
        return;
      }
    }

    // Check if an FCM token already exists
    const existingToken = await getToken(message);
    if (!existingToken) {
      console.error('Failed to get FCM token.');
      return;
    }

    console.log('FCM Token:', existingToken);

    const userDocRef = doc(
      db,
      'organizations',
      organizationId,
      'properties',
      propertyId,
      'residents',
      userId
    );

    // Check if the token is already stored to avoid duplicates
    const userDocSnap = await getDoc(userDocRef);
    const userData = userDocSnap.data();
    const storedTokens = userData?.fcmTokens || [];

    if (storedTokens.includes(existingToken)) {
      console.log('FCM token already stored.');
      return existingToken;
    }

    // Store the new token in an array field named 'fcmTokens'
    await setDoc(userDocRef, {
      fcmTokens: arrayUnion(existingToken)
    }, { merge: true });

    return existingToken;

  } catch (error) {
    console.error('Error registering for push notifications:', error);
  }
};
