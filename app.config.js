module.exports = ({ config }) => {
  return {
    ...config,
    plugins: [
      'expo-router',
      [
        'expo-image-picker',
        {
          photosPermission:
            'The app accesses your photos to let you attach images to violation reports.',
          cameraPermission:
            'The app accesses your camera to let you take photos for violation reports.',
        },
      ],
      [
        '@sentry/react-native/expo',
        {
          url: 'https://sentry.io/',
          project: 'amenilink-resident',
          organization: '24hr-car-unlock-2f6982a53',
        },
      ],
      [
        '@react-native-firebase/app',
        {
          ios: {
            useFrameworks: 'static',
          },
        },
      ],
      [
        '@react-native-firebase/messaging',
        {
          ios: {
            useFrameworks: 'static',
          },
        },
      ],
      [
        'expo-notifications',
        {
          icon: './assets/images/icon.png',
          color: '#ffffff',
        },
      ],
    ],
    android: {
      package: 'com.amenilink.resident',
      ...config.android,
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON,
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY,
        },
      },
    },
    ios: {
      bundleIdentifier: 'com.amenilink.resident',
      ...config.ios,
      googleServicesFile: process.env.GOOGLE_SERVICES_PLIST,
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
      },
    },
  };
};
