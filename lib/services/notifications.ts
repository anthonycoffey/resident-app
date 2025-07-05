import { doc, setDoc } from 'firebase/firestore';
import * as Notifications from 'expo-notifications';
import { db } from '../config/firebaseConfig';

export const registerForPushNotificationsAsync = async (userId: string) => {
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

    if (token) {
      const userDocRef = doc(db, 'users', userId);
      await setDoc(userDocRef, { expoPushToken: token }, { merge: true });
    }
  } catch (error) {
    console.error('Error registering for push notifications:', error);
  }

  return token;
};
