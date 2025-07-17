import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeAuth,
  // @ts-ignore
  getReactNativePersistence,
  connectAuthEmulator,
} from 'firebase/auth';
import {
  getFirestore,
  connectFirestoreEmulator,
  enableMultiTabIndexedDbPersistence,
} from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// This is a global variable set by React Native and Expo, true in development
declare const __DEV__: boolean;

GoogleSignin.configure({
  webClientId:
    '76291599872-bhbovp08rl51dlsniukp4uq2eatj11lu.apps.googleusercontent.com',
});

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

const db = getFirestore(app);
const functions = getFunctions(app);
const storage = getStorage(app);

// if (__DEV__) {
//   console.log('Connecting to Firebase Emulator...');
//   // Note: The IP address must be 10.0.2.2 for Android emulators to connect to the host machine's localhost
//   // For iOS, you can use 'localhost' or '127.0.0.1'
//   // Since this is a managed Expo app, we'll stick to localhost and assume the user is running on iOS or web for emulator testing, or knows how to configure their network.
//   const host = '127.0.0.1';
  
//   try {
//     connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
//     connectFirestoreEmulator(db, host, 8080);
//     connectFunctionsEmulator(functions, host, 5001);
//     connectStorageEmulator(storage, host, 9199);
//     console.log('Successfully connected to Firebase Emulator.');
//   } catch (e) {
//     console.error('Error connecting to Firebase Emulator:', e);
//   }
// }

export { app, auth, db, functions, storage };
