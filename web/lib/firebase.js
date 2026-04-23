import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  signInWithPopup,
  getAuth,
  setPersistence,
  signOut,
  browserLocalPersistence,
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
  const rawConfig = process.env.NEXT_PUBLIC_FIREBASE_CONFIG;

  if (!rawConfig) {
    return defaultFirebaseConfig;
  }

  try {
    const normalizedConfig = rawConfig.trim().replace(/^(['"])(.*)\1$/s, '$2');
    return JSON.parse(normalizedConfig);
  } catch (_error) {
    console.warn('NEXT_PUBLIC_FIREBASE_CONFIG is not valid JSON. Falling back to default config.');
    return defaultFirebaseConfig;
  }
};

export const getFirebaseApp = () => {
  if (getApps().length) {
    return getApp();
  }

  return initializeApp(parseFirebaseConfig());
};

export const getFirebaseAuth = async () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const auth = getAuth(getFirebaseApp());
  await setPersistence(auth, browserLocalPersistence);
  return auth;
};

export const createGoogleProvider = () => {
  const provider = new GoogleAuthProvider();
  provider.addScope('email');
  provider.addScope('profile');
  provider.setCustomParameters({
    prompt: 'select_account',
  });
  return provider;
};

export const signInWithGooglePopup = async () => {
  const auth = await getFirebaseAuth();

  if (!auth) {
    throw new Error('Google sign-in is only available in the browser.');
  }

  return signInWithPopup(auth, createGoogleProvider());
};

export const signOutFromFirebase = async () => {
  if (typeof window === 'undefined' || !getApps().length) {
    return;
  }

  const auth = getAuth(getApp());

  if (!auth.currentUser) {
    return;
  }

  await signOut(auth);
};
