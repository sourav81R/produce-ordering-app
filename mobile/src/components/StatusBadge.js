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
    backgroundColor: theme.colors.cancelledSoft,
    color: theme.colors.cancelled,
  },
};

export default function StatusBadge({ status }) {
  const stylesForStatus = statusStyles[status] || {
    backgroundColor: theme.colors.surfaceMuted,
    color: theme.colors.text,
  };

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: stylesForStatus.backgroundColor,
          borderColor: `${stylesForStatus.color}22`,
        },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: stylesForStatus.color }]} />
      <Text style={[styles.label, { color: stylesForStatus.color }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
});
