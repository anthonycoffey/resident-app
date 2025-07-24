import { router, Href } from 'expo-router';
import { FirebaseMessagingTypes } from '@react-native-firebase/messaging';

export function handleNotification(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage | null
) {
  if (remoteMessage?.data?.link) {
    const link = remoteMessage.data.link as Href;
    console.log('Navigating to link:', link);
    router.push(link);
  }
}
