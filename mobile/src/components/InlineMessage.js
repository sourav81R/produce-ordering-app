import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants/theme';

const toneStyles = {
  info: {
    backgroundColor: theme.colors.infoSoft,
    borderColor: '#C7E3DD',
    color: theme.colors.info,
    icon: 'information-circle',
  },
  success: {
    backgroundColor: theme.colors.successSoft,
    borderColor: '#CDE7D3',
    color: theme.colors.success,
    icon: 'checkmark-circle',
  },
  warning: {
    backgroundColor: theme.colors.warningSoft,
    borderColor: '#F1D9A9',
    color: theme.colors.warning,
    icon: 'alert-circle',
  },
  danger: {
    backgroundColor: theme.colors.dangerSoft,
    borderColor: '#F3C7C1',
    color: theme.colors.danger,
    icon: 'warning',
  },
};

export default function InlineMessage({ message, tone = 'info', style }) {
  if (!message) {
    return null;
  }

  const config = toneStyles[tone] || toneStyles.info;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: config.backgroundColor,
          borderColor: config.borderColor,
        },
        style,
      ]}
    >
      <Ionicons name={config.icon} size={18} color={config.color} />
      <Text style={[styles.text, { color: config.color }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  text: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
});
