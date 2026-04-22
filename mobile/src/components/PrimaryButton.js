import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { theme } from '../constants/theme';

export default function PrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
}) {
  const isSecondary = variant === 'secondary';
  const isDisabled = loading || disabled;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isSecondary ? styles.secondaryButton : styles.primaryButton,
        isDisabled && styles.disabledButton,
      ]}
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator color={isSecondary ? theme.colors.text : '#ffffff'} />
      ) : (
        <Text style={[styles.label, isSecondary ? styles.secondaryLabel : styles.primaryLabel]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
  },
  secondaryButton: {
    backgroundColor: theme.colors.surfaceMuted,
  },
  disabledButton: {
    opacity: 0.7,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
  },
  primaryLabel: {
    color: '#ffffff',
  },
  secondaryLabel: {
    color: theme.colors.text,
  },
});
