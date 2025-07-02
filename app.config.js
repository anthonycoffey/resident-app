module.exports = ({ config }) => {
  return {
    ...config,
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