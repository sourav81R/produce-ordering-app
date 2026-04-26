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
import InlineMessage from '../components/InlineMessage';
import PrimaryButton from '../components/PrimaryButton';
import SectionCard from '../components/SectionCard';
import TextField from '../components/TextField';
import { theme } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen({ onSwitchMode }) {
  const navigation = useNavigation();
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
      setSuccess('Account created successfully. You can start browsing the catalogue now.');
      setName('');
      setEmail('');
      setPassword('');
      if (!onSwitchMode) {
        return;
      }
    } catch (requestError) {
      setError(requestError.message || 'Unable to register.');
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
        <LinearGradient colors={['#0F6B37', '#1F8F4D', '#A9D69D']} style={styles.hero}>
          <View style={styles.heroBadge}>
            <Ionicons name="storefront-outline" size={16} color={theme.colors.white} />
            <Text style={styles.heroBadgeText}>Retailer onboarding</Text>
          </View>
          <Text style={styles.heroTitle}>Create your wholesale produce workspace.</Text>
          <Text style={styles.heroSubtitle}>
            Register once to manage stock planning, orders, favorites, and delivery updates across web and mobile.
          </Text>
        </LinearGradient>

        <SectionCard style={styles.card}>
          <Text style={styles.heading}>Create account</Text>
          <Text style={styles.subheading}>
            Keep it simple. We only need your name, business email, and password to get started.
          </Text>

          <InlineMessage message={error} tone="danger" style={styles.message} />
          <InlineMessage message={success} tone="success" style={styles.message} />

          <View style={styles.form}>
            <TextField
              label="Full name"
              value={name}
              onChangeText={setName}
              placeholder="Jane Doe"
            />
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
              caption="Use a password you can remember easily while testing the app."
            />
            <PrimaryButton
              title="Create account"
              onPress={handleRegister}
              loading={submitting}
              icon="person-add-outline"
            />
          </View>

          <View style={styles.helperRow}>
            <Text style={styles.helperText}>Already registered?</Text>
            <Pressable
              onPress={() => {
                if (onSwitchMode) {
                  onSwitchMode('login');
                  return;
                }

                navigation.navigate('Login');
              }}
            >
              <Text style={styles.linkText}>Sign in</Text>
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
    ...theme.shadows.card,
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
  card: {
    gap: 16,
    backgroundColor: 'rgba(255,255,255,0.98)',
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
});
