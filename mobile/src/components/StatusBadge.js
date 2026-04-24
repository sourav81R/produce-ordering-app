import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants/theme';

const statusStyles = {
  Pending: {
    backgroundColor: theme.colors.pendingSoft,
    color: theme.colors.pending,
  },
  Confirmed: {
    backgroundColor: theme.colors.confirmedSoft,
    color: theme.colors.confirmed,
  },
  Delivered: {
    backgroundColor: theme.colors.deliveredSoft,
    color: theme.colors.delivered,
  },
  Cancelled: {
    backgroundColor: theme.colors.dangerSoft,
    color: theme.colors.danger,
  },
};

export default function StatusBadge({ status }) {
  const stylesForStatus = statusStyles[status] || {
    backgroundColor: theme.colors.surfaceMuted,
    color: theme.colors.text,
  };

  return (
    <View style={[styles.badge, { backgroundColor: stylesForStatus.backgroundColor }]}>
      <Text style={[styles.label, { color: stylesForStatus.color }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
  },
});

