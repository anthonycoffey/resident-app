module.exports = ({ config }) => {
  return {
    ...config,
    plugins: [
      '@react-native-firebase/app',
      '@react-native-firebase/messaging',
      [
        'expo-build-properties',
        {
          ios: {
            useFrameworks: 'static',
          },
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
      entitlements: {
        'aps-environment': 'production',
      },
      ...config.ios,
      googleServicesFile: process.env.GOOGLE_SERVICES_PLIST,
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
      },
    },
  };
};
