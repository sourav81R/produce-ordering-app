import * as AuthSession from 'expo-auth-session';
import { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import TextField from '../components/TextField';
import { signInToFirebaseWithGoogleIdToken, signOutFromFirebase } from '../config/firebase';
import { theme } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ onSwitchMode }) {
  const { login, loginWithFirebaseIdToken } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [error, setError] = useState('');
  const googleClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '';
  const [nonce] = useState(() => `${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const redirectUri = useMemo(
    () =>
      AuthSession.makeRedirectUri({
        scheme: 'produce-ordering-app',
        path: 'oauth',
      }),
    []
  );
  const discovery = AuthSession.useAutoDiscovery('https://accounts.google.com');
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: googleClientId || 'missing-google-client-id',
      redirectUri,
      scopes: ['openid', 'profile', 'email'],
      responseType: AuthSession.ResponseType.IdToken,
      usePKCE: false,
      extraParams: { nonce },
    },
    discovery
  );

  useEffect(() => {
    const finishGoogleLogin = async () => {
      if (!response) {
        return;
      }

      if (response.type !== 'success') {
        setGoogleSubmitting(false);

        if (response.type === 'error') {
          setError(response.error?.message || 'Google sign-in failed.');
        }

        return;
      }

      try {
        setError('');
        const googleIdToken = response.params.id_token;

        if (!googleIdToken) {
          throw new Error('Google did not return an ID token.');
        }

        const firebaseCredential = await signInToFirebaseWithGoogleIdToken(googleIdToken);
        const firebaseIdToken = await firebaseCredential.user.getIdToken(true);
        await loginWithFirebaseIdToken(firebaseIdToken);
      } catch (requestError) {
        await signOutFromFirebase();
        setError(requestError.message || 'Unable to continue with Google.');
      } finally {
        setGoogleSubmitting(false);
      }
    };

    finishGoogleLogin();
  }, [loginWithFirebaseIdToken, response]);

  const handleLogin = async () => {
    setSubmitting(true);
    setError('');

    try {
      await login(email.trim(), password);
    } catch (requestError) {
      setError(requestError.message || 'Unable to sign in.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!googleClientId) {
      setError('Missing EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID for Google sign-in.');
      return;
    }

    if (!request) {
      setError('Google sign-in is still initializing. Please try again.');
      return;
    }

    setGoogleSubmitting(true);
    setError('');

    try {
      await promptAsync();
    } catch (requestError) {
      setGoogleSubmitting(false);
      setError(requestError.message || 'Unable to start Google sign-in.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.card}
    >
      <Text style={styles.heading}>Login</Text>
      <Text style={styles.subheading}>Use your account to place and review produce orders.</Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.form}>
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@example.com"
        />
        <TextField
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Enter your password"
        />
        <PrimaryButton
          title="Login"
          onPress={handleLogin}
          loading={submitting}
          disabled={googleSubmitting}
        />
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>
        <PrimaryButton
          title={googleSubmitting ? 'Connecting to Google...' : 'Continue with Google'}
          onPress={handleGoogleLogin}
          loading={googleSubmitting}
          disabled={submitting || !request}
          variant="secondary"
        />
      </View>

      <Text style={styles.helperText}>
        Need an account?{' '}
        <Text style={styles.linkText} onPress={() => onSwitchMode('register')}>
          Register
        </Text>
      </Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
  },
  subheading: {
    marginTop: 8,
    color: theme.colors.muted,
    lineHeight: 22,
  },
  form: {
    marginTop: 18,
    gap: 14,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    color: theme.colors.muted,
    fontWeight: '600',
  },
  errorText: {
    marginTop: 16,
    backgroundColor: theme.colors.dangerSoft,
    color: theme.colors.danger,
    padding: 12,
    borderRadius: 12,
    fontWeight: '600',
  },
  helperText: {
    marginTop: 18,
    color: theme.colors.muted,
  },
  linkText: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
});
