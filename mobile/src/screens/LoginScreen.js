import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import PrimaryButton from '../components/PrimaryButton';
import TextField from '../components/TextField';
import { theme } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ onSwitchMode }) {
  const navigation = useNavigation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setSubmitting(true);
    setError('');

    try {
      await login(email.trim(), password.trim());
    } catch (requestError) {
      setError(requestError.message || 'Unable to sign in.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.screen}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.heading}>Login</Text>
          <Text style={styles.subheading}>
            Sign in to browse produce, place bulk orders, and track delivery status.
          </Text>

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
            <PrimaryButton title="Login" onPress={handleLogin} loading={submitting} />
          </View>

          <View style={styles.helperRow}>
            <Text style={styles.helperText}>Need an account? </Text>
            <Pressable
              onPress={() => {
                if (onSwitchMode) {
                  onSwitchMode('register');
                  return;
                }

                navigation.navigate('Register');
              }}
            >
              <Text style={styles.linkText}>Create one</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  card: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 28,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  heading: {
    fontSize: 28,
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
    gap: 16,
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
    color: theme.colors.muted,
  },
  helperRow: {
    marginTop: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  linkText: {
    color: theme.colors.secondary,
    fontWeight: '700',
  },
});
