module.exports = ({ config }) => {
  return {
    ...config,
    plugins: [
      '@react-native-firebase/app',
      '@react-native-firebase/messaging',
      ['@react-native-google-signin/google-signin'],
      [
        'expo-build-properties',
        {
          ios: {
            useFrameworks: 'static',
          },
        },
      ],
      [
        'react-native-maps',
        {
          iosGoogleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
          androidGoogleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
        },
      ],
    ],
    android: {
      package: 'com.amenilink.resident',
      ...config.android,
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON,
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
        },
      },
    },
    ios: {
      bundleIdentifier: 'com.amenilink.resident',
      entitlements: {
        'aps-environment': 'production',
      },
      ...config.ios,
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          'This app uses location services to show maps and provide location-based features.',
      },
      googleServicesFile: process.env.GOOGLE_SERVICES_PLIST,
      config: {
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      },
    },
  };
};
