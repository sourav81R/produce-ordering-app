import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  browserLocalPersistence,
  GoogleAuthProvider,
  getReactNativePersistence,
  getAuth,
  initializeAuth,
  setPersistence,
  signInWithCredential,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { logger } from '../utils/logger';

const defaultFirebaseConfig = {
  apiKey: 'AIzaSyBhOBrJgkyU0WfyqN9bBOQMLVMnmW5iTuo',
  authDomain: 'produce-ordering-app.firebaseapp.com',
  projectId: 'produce-ordering-app',
  storageBucket: 'produce-ordering-app.firebasestorage.app',
  messagingSenderId: '49028414977',
  appId: '1:49028414977:web:6bbbf7394d5d3b7d1e8a00',
};

const parseFirebaseConfig = () => {
  const rawConfig = process.env.EXPO_PUBLIC_FIREBASE_CONFIG;

  if (!rawConfig) {
    return defaultFirebaseConfig;
  }

  try {
    const normalizedConfig = rawConfig.trim().replace(/^(['"])(.*)\1$/s, '$2');
    return JSON.parse(normalizedConfig);
  } catch (_error) {
    logger.warn('EXPO_PUBLIC_FIREBASE_CONFIG is not valid JSON. Falling back to default config.');
    return defaultFirebaseConfig;
  }
};

const firebaseApp = getApps().length ? getApp() : initializeApp(parseFirebaseConfig());

let firebaseAuth;

try {
  firebaseAuth = initializeAuth(firebaseApp, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (_error) {
  firebaseAuth = getAuth(firebaseApp);
}

export const mobileFirebaseAuth = firebaseAuth;

export const getGoogleAuthClientIds = () => ({
  clientId:
    process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ||
    process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ||
    process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ||
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
    '',
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '',
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '',
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
});

export const isGoogleAuthConfigured = (clientIds = getGoogleAuthClientIds()) =>
  Boolean(
    clientIds.clientId ||
      clientIds.androidClientId ||
      clientIds.iosClientId ||
      clientIds.webClientId
  );

export const signInToFirebaseWithGoogleToken = async ({ idToken, accessToken }) => {
  if (!idToken && !accessToken) {
    throw new Error('Google sign-in did not return a usable token.');
  }

  const credential = GoogleAuthProvider.credential(idToken || null, accessToken || null);
  return signInWithCredential(mobileFirebaseAuth, credential);
};

export const signInToFirebaseWithGooglePopup = async () => {
  const provider = new GoogleAuthProvider();
  provider.addScope('email');
  provider.addScope('profile');
  provider.setCustomParameters({
    prompt: 'select_account',
  });

  await setPersistence(mobileFirebaseAuth, browserLocalPersistence);
  return signInWithPopup(mobileFirebaseAuth, provider);
};

export const signOutFromFirebase = async () => {
  if (!mobileFirebaseAuth.currentUser) {
    return;
  }

  await signOut(mobileFirebaseAuth);
};
