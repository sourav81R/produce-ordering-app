import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import TextField from '../components/TextField';
import { theme } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen({ onSwitchMode }) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async () => {
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      setSuccess('Registration successful. Please login with your new account.');
      setName('');
      setEmail('');
      setPassword('');
    } catch (requestError) {
      setError(requestError.message || 'Unable to register.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.card}
    >
      <Text style={styles.heading}>Register</Text>
      <Text style={styles.subheading}>Create an account for ordering fresh produce.</Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {success ? <Text style={styles.successText}>{success}</Text> : null}

      <View style={styles.form}>
        <TextField label="Full Name" value={name} onChangeText={setName} placeholder="Jane Doe" />
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
          placeholder="At least 6 characters"
        />
        <PrimaryButton title="Register" onPress={handleRegister} loading={submitting} />
      </View>

      <Text style={styles.helperText}>
        Already registered?{' '}
        <Text style={styles.linkText} onPress={() => onSwitchMode('login')}>
          Login
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
  errorText: {
    marginTop: 16,
    backgroundColor: theme.colors.dangerSoft,
    color: theme.colors.danger,
    padding: 12,
    borderRadius: 12,
    fontWeight: '600',
  },
  successText: {
    marginTop: 16,
    backgroundColor: theme.colors.successSoft,
    color: theme.colors.success,
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
