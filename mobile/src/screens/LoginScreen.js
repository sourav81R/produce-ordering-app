import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
import GoogleSignInButton from '../components/GoogleSignInButton';
import InlineMessage from '../components/InlineMessage';
import PrimaryButton from '../components/PrimaryButton';
import SectionCard from '../components/SectionCard';
import TextField from '../components/TextField';
import { theme } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

const highlights = [
  'Order vegetables and fruits in bulk',
  'Track delivery status from one screen',
  'Save favorites for faster reorders',
];

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
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <LinearGradient colors={['#305D2E', '#6F9B43']} style={styles.hero}>
          <View style={styles.heroBadge}>
            <Ionicons name="leaf" size={16} color={theme.colors.white} />
            <Text style={styles.heroBadgeText}>GoVigi</Text>
          </View>
          <Text style={styles.heroTitle}>Fresh produce ordering for modern retailers.</Text>
          <Text style={styles.heroSubtitle}>
            Sign in to browse stock, place bulk orders, and keep every delivery on track.
          </Text>

          <View style={styles.heroList}>
            {highlights.map((item) => (
              <View key={item} style={styles.heroListItem}>
                <Ionicons name="checkmark-circle" size={16} color={theme.colors.white} />
                <Text style={styles.heroListText}>{item}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        <SectionCard style={styles.card}>
          <Text style={styles.heading}>Welcome back</Text>
          <Text style={styles.subheading}>Use your account to continue into the retailer app.</Text>

          <InlineMessage message={error} tone="danger" style={styles.message} />

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
              title="Sign in"
              onPress={handleLogin}
              loading={submitting}
              icon="log-in-outline"
            />
          </View>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          <GoogleSignInButton onError={setError} />

          <View style={styles.helperRow}>
            <Text style={styles.helperText}>Need an account?</Text>
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
        </SectionCard>
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
    paddingHorizontal: 20,
    paddingVertical: 32,
    gap: 18,
  },
  hero: {
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    gap: 12,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: theme.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  heroBadgeText: {
    color: theme.colors.white,
    fontWeight: '800',
  },
  heroTitle: {
    color: theme.colors.white,
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 38,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 15,
    lineHeight: 22,
  },
  heroList: {
    marginTop: 6,
    gap: 10,
  },
  heroListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heroListText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    gap: 16,
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.text,
  },
  subheading: {
    color: theme.colors.muted,
    lineHeight: 22,
  },
  message: {
    marginTop: -4,
  },
  form: {
    gap: 16,
  },
  helperText: {
    color: theme.colors.muted,
  },
  helperRow: {
    marginTop: 4,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  linkText: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    color: theme.colors.subtle,
    fontWeight: '600',
    fontSize: 12,
    textTransform: 'uppercase',
  },
});
