import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  getAuth,
  getReactNativePersistence,
  initializeAuth,
  signInWithCredential,
  signOut,
} from 'firebase/auth';

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
    console.warn('EXPO_PUBLIC_FIREBASE_CONFIG is not valid JSON. Falling back to default config.');
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

export const signInToFirebaseWithGoogleIdToken = async (googleIdToken) => {
  const credential = GoogleAuthProvider.credential(googleIdToken);
  return signInWithCredential(mobileFirebaseAuth, credential);
};

export const signOutFromFirebase = async () => {
  if (!mobileFirebaseAuth.currentUser) {
    return;
  }

  await signOut(mobileFirebaseAuth);
};
