import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { apiClient, getApiErrorMessage } from '../api/client';
import StatusBadge from '../components/StatusBadge';
import { theme } from '../constants/theme';
import { formatDisplayDate } from '../utils/date';

export default function OrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useFocusEffect(
    useCallback(() => {
      const loadOrders = async () => {
        setLoading(true);
        setError('');

        try {
          const response = await apiClient.get('/orders');
          setOrders(response.data);
        } catch (requestError) {
          setError(getApiErrorMessage(requestError, 'Unable to load orders.'));
        } finally {
          setLoading(false);
        }
      };

      loadOrders();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My Orders</Text>
      <Text style={styles.subheading}>Track retailer orders and delivery progress in one place.</Text>

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.productName}>{item.productId?.name}</Text>
                  <Text style={styles.productMeta}>
                    {item.productId?.category} | Rs. {item.productId?.price}/{item.productId?.unit}
                  </Text>
                </View>
                <StatusBadge status={item.status} />
              </View>
              <Text style={styles.detailText}>Quantity: {item.quantity}</Text>
              <Text style={styles.detailText}>
                Delivery Date: {formatDisplayDate(item.deliveryDate)}
              </Text>
              <Text style={styles.detailText}>Ordered On: {formatDisplayDate(item.createdAt)}</Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No orders yet. Browse our catalogue to get started.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 14,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
  },
  subheading: {
    color: theme.colors.muted,
    lineHeight: 22,
  },
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    gap: 12,
    paddingVertical: 8,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.accent,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'flex-start',
  },
  productName: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  productMeta: {
    marginTop: 6,
    color: theme.colors.muted,
  },
  detailText: {
    marginTop: 10,
    color: theme.colors.text,
  },
  errorText: {
    backgroundColor: theme.colors.dangerSoft,
    color: theme.colors.danger,
    padding: 12,
    borderRadius: 12,
    fontWeight: '600',
  },
  emptyText: {
    color: theme.colors.muted,
    textAlign: 'center',
    marginTop: 18,
  },
});
