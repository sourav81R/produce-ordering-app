const pkg = require('./package.json');

const appVersion = process.env.APP_VERSION || pkg.version || '1.0.0';
const androidVersionCode = Number(process.env.ANDROID_VERSION_CODE || 1);
const iosBuildNumber = process.env.IOS_BUILD_NUMBER || '1';
const easProjectId =
  process.env.EXPO_PUBLIC_EAS_PROJECT_ID || process.env.EAS_PROJECT_ID || '';
const updatesUrl = easProjectId ? `https://u.expo.dev/${easProjectId}` : undefined;

if (!easProjectId) {
  console.warn(
    'Expo Updates is disabled because EXPO_PUBLIC_EAS_PROJECT_ID is not set. Set it before building release APKs that should auto-update.'
  );
}

module.exports = () => ({
  expo: {
    name: 'GoVigi Produce',
    slug: 'produce-ordering-app',
    scheme: 'produce-ordering-app',
    version: appVersion,
    orientation: 'portrait',
    userInterfaceStyle: 'light',
    newArchEnabled: false,
    icon: './assets/icon.png',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#F4F6EF',
    },
    assetBundlePatterns: ['**/*'],
    runtimeVersion: {
      policy: 'appVersion',
    },
    updates: {
      enabled: Boolean(updatesUrl),
      url: updatesUrl,
      checkAutomatically: 'NEVER',
      fallbackToCacheTimeout: 0,
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.produceordering.app',
      buildNumber: iosBuildNumber,
    },
    android: {
      package: 'com.produceordering.app',
      versionCode: androidVersionCode,
      edgeToEdgeEnabled: true,
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#F4F6EF',
      },
      permissions: ['INTERNET', 'ACCESS_NETWORK_STATE'],
    },
    plugins: [
      '@react-native-community/datetimepicker',
      'expo-updates',
    ],
    extra: {
      apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || '',
      appEnv: process.env.EXPO_PUBLIC_APP_ENV || 'production',
      easProjectId,
      eas: easProjectId
        ? {
            projectId: easProjectId,
          }
        : undefined,
    },
  },
});
