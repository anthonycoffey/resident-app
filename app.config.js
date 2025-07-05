module.exports = ({ config }) => {
  return {
    ...config,
    plugins: [
      [
        'expo-notifications',
        {
          icon: './assets/images/icon.png',
          color: '#ffffff',
        },
      ],
    ],
    android: {
      package: 'com.phoenix.resident',
      ...config.android,
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON,
    },
    ios: {
      ...config.ios,
      googleServicesFile: process.env.GOOGLE_SERVICES_PLIST,
    },
  };
};
