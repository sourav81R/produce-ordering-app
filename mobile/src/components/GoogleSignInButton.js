import { useEffect, useMemo, useState } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import GoogleAuthButton from './GoogleAuthButton';
import {
  getGoogleAuthClientIds,
  isGoogleAuthConfigured,
  signInToFirebaseWithGooglePopup,
  signInToFirebaseWithGoogleToken,
} from '../config/firebase';
import { useAuth } from '../context/AuthContext';

WebBrowser.maybeCompleteAuthSession();

const placeholderGoogleClientId = 'missing-google-client-id';

const getGoogleAuthErrorMessage = (error) =>
  error?.message || 'Unable to continue with Google right now.';

const getMissingGoogleConfigMessage = () => {
  if (Platform.OS === 'android') {
    return (
      'Google sign-in is not configured in this APK yet. Add EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID in mobile/.env, then rebuild and reinstall the Android app.'
    );
  }

  if (Platform.OS === 'ios') {
    return (
      'Google sign-in is not configured in this app yet. Add EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID in mobile/.env, then rebuild and reinstall the iOS app.'
    );
  }

  return 'Google sign-in is not configured yet. Add the Expo Google client IDs in mobile/.env and rebuild the app.';
};

export default function GoogleSignInButton({ onError }) {
  const { loginWithGoogle } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const isWeb = Platform.OS === 'web';
  const googleClientIds = useMemo(() => getGoogleAuthClientIds(), []);
  const googleAuthConfigured = isWeb || isGoogleAuthConfigured(googleClientIds);
  const authConfig = googleAuthConfigured
    ? googleClientIds
    : { clientId: placeholderGoogleClientId };

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    ...authConfig,
    selectAccount: true,
    scopes: ['email', 'profile'],
  });

  useEffect(() => {
    let active = true;

    const finalizeGoogleSignIn = async () => {
      if (!response) {
        return;
      }

      if (response.type === 'cancel' || response.type === 'dismiss') {
        if (active) {
          setSubmitting(false);
        }
        return;
      }

      if (response.type !== 'success') {
        if (active) {
          onError?.('Google sign-in could not be completed.');
          setSubmitting(false);
        }
        return;
      }

      try {
        const firebaseCredential = await signInToFirebaseWithGoogleToken({
          idToken: response.params?.id_token,
          accessToken: response.params?.access_token,
        });
        const firebaseIdToken = await firebaseCredential.user.getIdToken();

        await loginWithGoogle(firebaseIdToken);
      } catch (error) {
        if (active) {
          onError?.(getGoogleAuthErrorMessage(error));
        }
      } finally {
        if (active) {
          setSubmitting(false);
        }
      }
    };

    finalizeGoogleSignIn();

    return () => {
      active = false;
    };
  }, [loginWithGoogle, onError, response]);

  const handleGoogleSignIn = async () => {
    onError?.('');

    if (isWeb) {
      setSubmitting(true);

      try {
        const credential = await signInToFirebaseWithGooglePopup();
        const firebaseIdToken = await credential.user.getIdToken();

        await loginWithGoogle(firebaseIdToken);
      } catch (error) {
        onError?.(getGoogleAuthErrorMessage(error));
      } finally {
        setSubmitting(false);
      }

      return;
    }

    if (!googleAuthConfigured) {
      onError?.(getMissingGoogleConfigMessage());
      return;
    }

    if (!request) {
      onError?.('Google sign-in is still preparing. Please try again in a moment.');
      return;
    }

    setSubmitting(true);

    try {
      const result = await promptAsync();

      if (result.type !== 'success' && result.type !== 'opened') {
        setSubmitting(false);
      }
    } catch (error) {
      setSubmitting(false);
      onError?.(getGoogleAuthErrorMessage(error));
    }
  };

  return (
    <GoogleAuthButton
      title={submitting ? 'Connecting to Google...' : 'Continue with Google'}
      onPress={handleGoogleSignIn}
      loading={submitting}
      disabled={submitting || (!isWeb && googleAuthConfigured && !request)}
    />
  );
}
