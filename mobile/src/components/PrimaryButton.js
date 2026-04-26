import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../constants/theme';

export default function PrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  icon,
  style,
  labelStyle,
}) {
  const isSecondary = variant === 'secondary';
  const isGhost = variant === 'ghost';
  const isPrimary = !isSecondary && !isGhost;
  const isDisabled = loading || disabled;
  const iconColor = isSecondary || isGhost ? theme.colors.text : theme.colors.white;
  const content = loading ? (
    <ActivityIndicator color={iconColor} />
  ) : (
    <View style={styles.content}>
      {icon ? <Ionicons name={icon} size={18} color={iconColor} /> : null}
      <Text
        style={[
          styles.label,
          isSecondary || isGhost ? styles.secondaryLabel : styles.primaryLabel,
          labelStyle,
        ]}
      >
        {title}
      </Text>
    </View>
  );

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isSecondary ? styles.secondaryButton : isGhost ? styles.ghostButton : styles.primaryButton,
        isDisabled && styles.disabledButton,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
    >
      {isPrimary ? (
        <LinearGradient colors={['#1F8F4D', '#0F6B37']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.fill}>
          {content}
        </LinearGradient>
      ) : (
        <View style={[styles.fill, isSecondary ? styles.secondaryFill : styles.ghostFill]}>{content}</View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
  },
  primaryButton: {
    ...theme.shadows.soft,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  ghostButton: {
    backgroundColor: 'transparent',
  },
  fill: {
    minHeight: 52,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryFill: {
    backgroundColor: '#FFFBE7',
  },
  ghostFill: {
    backgroundColor: 'transparent',
  },
  disabledButton: {
    opacity: 0.7,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
  },
  primaryLabel: {
    color: theme.colors.white,
  },
  secondaryLabel: {
    color: theme.colors.text,
  },
});
