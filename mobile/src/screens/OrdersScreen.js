import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { apiClient, getApiErrorMessage } from '../api/client';
import StatusBadge from '../components/StatusBadge';
import { theme } from '../constants/theme';
import { formatDisplayDate } from '../utils/date';

const getDisplayStatus = (order) => (order.cancelledAt ? 'Cancelled' : order.status);

export default function OrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOrders = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.get('/orders');
      const nextOrders = Array.isArray(response.data?.orders)
        ? response.data.orders
        : Array.isArray(response.data)
          ? response.data
          : [];
      setOrders(nextOrders);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Unable to load orders.'));
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [])
  );

  const handleCancel = async (orderId) => {
    try {
      await apiClient.post(`/orders/${orderId}/cancel`, {
        reason: 'Cancelled from the GoVigi mobile app',
      });
      await loadOrders();
    } catch (requestError) {
      Alert.alert('Unable to cancel order', getApiErrorMessage(requestError, 'Please try again.'));
    }
  };

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
                  <Text style={styles.orderId}>{`Order #${item._id.slice(-8)}`}</Text>
                  <Text style={styles.orderMeta}>{formatDisplayDate(item.createdAt)}</Text>
                </View>
                <StatusBadge status={getDisplayStatus(item)} />
              </View>

              <View style={styles.itemsList}>
                {item.items?.map((orderItem) => (
                  <View style={styles.orderItem} key={`${item._id}-${orderItem.product?._id || orderItem.name}`}>
                    <Text style={styles.orderEmoji}>{orderItem.emoji}</Text>
                    <View>
                      <Text style={styles.orderItemName}>{orderItem.name}</Text>
                      <Text style={styles.orderItemMeta}>
                        {`${orderItem.quantity} × ₹${orderItem.price} / ${orderItem.unit}`}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              <Text style={styles.detailText}>{`Delivery: ${formatDisplayDate(item.deliveryDate)}`}</Text>
              <Text style={styles.detailText}>{`Payment: ${item.paymentMethod} · ${item.paymentStatus}`}</Text>
              <Text style={styles.detailText}>{`Total: ₹${item.totalAmount}`}</Text>
              {item.cancelReason ? <Text style={styles.detailMuted}>{`Reason: ${item.cancelReason}`}</Text> : null}

              {!item.cancelledAt && item.status !== 'Delivered' ? (
                <TouchableOpacity style={styles.cancelButton} onPress={() => handleCancel(item._id)} activeOpacity={0.75}>
                  <Text style={styles.cancelButtonText}>Cancel Order</Text>
                </TouchableOpacity>
              ) : null}
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
    paddingTop: 16,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.background,
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
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'flex-start',
  },
  orderId: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  orderMeta: {
    marginTop: 6,
    color: theme.colors.muted,
  },
  itemsList: {
    gap: 10,
  },
  orderItem: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  orderEmoji: {
    fontSize: 24,
  },
  orderItemName: {
    fontWeight: '700',
    color: theme.colors.text,
  },
  orderItemMeta: {
    color: theme.colors.muted,
  },
  detailText: {
    color: theme.colors.text,
  },
  detailMuted: {
    color: theme.colors.muted,
  },
  cancelButton: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.dangerSoft,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  cancelButtonText: {
    color: theme.colors.danger,
    fontWeight: '700',
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
