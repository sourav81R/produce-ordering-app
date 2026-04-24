import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants/theme';

export default function QuantityStepper({
  value,
  onDecrease,
  onIncrease,
  compact = false,
  style,
}) {
  return (
    <View style={[styles.container, compact && styles.compactContainer, style]}>
      <Pressable style={[styles.button, compact && styles.compactButton]} onPress={onDecrease}>
        <Ionicons name="remove" size={compact ? 16 : 18} color={theme.colors.primaryDark} />
      </Pressable>
      <Text style={[styles.value, compact && styles.compactValue]}>{value}</Text>
      <Pressable
        style={[styles.button, styles.buttonPrimary, compact && styles.compactButton]}
        onPress={onIncrease}
      >
        <Ionicons name="add" size={compact ? 16 : 18} color={theme.colors.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.xs,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceSoft,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  compactContainer: {
    gap: theme.spacing.xs,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  compactButton: {
    width: 32,
    height: 32,
  },
  buttonPrimary: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  value: {
    minWidth: 24,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.primaryDark,
  },
  compactValue: {
    fontSize: 15,
  },
});
